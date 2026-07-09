from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.dependency import get_db
from app.models.order import Order
from app.models.user import User
from app.schemas.auth import APIResponse
from app.schemas.order import OrderCreate, OrderUpdateStatus, OrderResponse
from app.services.currency_service import currency_service
from app.websocket.manager import manager

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new order in the database."""
    try:
        db_order = Order(
            customer_name=payload.customer_name.strip(),
            amount=payload.amount,
            status="Pending"  # Default status
        )
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        
        # Calculate USD amount using the currency service
        rate = await currency_service.get_inr_to_usd_rate()
        amount_usd = currency_service.convert_inr_to_usd(db_order.amount, rate)
        
        # Build OrderResponse response format
        order_dict = {
            "id": db_order.id,
            "customer_name": db_order.customer_name,
            "amount": db_order.amount,
            "status": db_order.status,
            "created_at": db_order.created_at,
            "amount_usd": amount_usd
        }
        order_data = OrderResponse(**order_dict)
        
        # Broadcast the new order event to connected WS clients (optional but helpful)
        await manager.broadcast({
            "event": "order_created",
            "data": order_data.model_dump() if hasattr(order_data, "model_dump") else order_data.dict()
        })
        
        return APIResponse(
            success=True,
            message="Order created successfully",
            data=order_data
        )
    except Exception as err:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(err)}"
        )

@router.get("", response_model=APIResponse)
async def get_orders(
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    sort: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List orders with support for search, status filtering, sorting, and pagination."""
    query = db.query(Order)
    
    # 1. Search filter on customer name
    if search:
        query = query.filter(Order.customer_name.ilike(f"%{search.strip()}%"))
        
    # 2. Status filter
    if status_filter:
        query = query.filter(Order.status == status_filter.strip())
        
    # 3. Sorting logic
    if sort:
        is_desc = sort.startswith("-")
        sort_field = sort[1:] if is_desc else sort
        
        column = getattr(Order, sort_field, None)
        if column is not None:
            query = query.order_by(column.desc() if is_desc else column.asc())
        else:
            query = query.order_by(Order.created_at.desc())
    else:
        # Default sort by created_at descending (most recent first)
        query = query.order_by(Order.created_at.desc())
        
    # 4. Count and paginate
    total_count = query.count()
    orders = query.offset(skip).limit(limit).all()
    
    # Get the current exchange rate
    rate = await currency_service.get_inr_to_usd_rate()
    
    # Convert ORM results into response schemas including dynamic USD values
    serialized_orders = []
    for order in orders:
        amount_usd = currency_service.convert_inr_to_usd(order.amount, rate)
        order_dict = {
            "id": order.id,
            "customer_name": order.customer_name,
            "amount": order.amount,
            "status": order.status,
            "created_at": order.created_at,
            "amount_usd": amount_usd
        }
        serialized_orders.append(OrderResponse(**order_dict))
        
    return APIResponse(
        success=True,
        message="Orders retrieved successfully",
        data={
            "orders": serialized_orders,
            "total": total_count
        }
    )

@router.get("/stats", response_model=APIResponse)
async def get_order_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve statistical counters for the dashboard summary cards."""
    total = db.query(Order).count()
    pending = db.query(Order).filter(Order.status == "Pending").count()
    processing = db.query(Order).filter(Order.status == "Processing").count()
    completed = db.query(Order).filter(Order.status == "Completed").count()
    cancelled = db.query(Order).filter(Order.status == "Cancelled").count()
    
    return APIResponse(
        success=True,
        message="Stats retrieved successfully",
        data={
            "total": total,
            "pending": pending,
            "processing": processing,
            "completed": completed,
            "cancelled": cancelled
        }
    )

@router.get("/{order_id}", response_model=APIResponse)
async def get_order_by_id(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve details of a single order by its ID."""
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
        
    rate = await currency_service.get_inr_to_usd_rate()
    amount_usd = currency_service.convert_inr_to_usd(db_order.amount, rate)
    
    order_dict = {
        "id": db_order.id,
        "customer_name": db_order.customer_name,
        "amount": db_order.amount,
        "status": db_order.status,
        "created_at": db_order.created_at,
        "amount_usd": amount_usd
    }
    
    return APIResponse(
        success=True,
        message="Order retrieved successfully",
        data=OrderResponse(**order_dict)
    )

@router.patch("/{order_id}/status", response_model=APIResponse)
async def update_order_status(
    order_id: int,
    payload: OrderUpdateStatus,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update status of an existing order and broadcast the change via WebSockets."""
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
        
    db_order.status = payload.status
    try:
        db.commit()
        db.refresh(db_order)
    except Exception as err:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database update failed: {str(err)}"
        )
        
    # Calculate USD amount
    rate = await currency_service.get_inr_to_usd_rate()
    amount_usd = currency_service.convert_inr_to_usd(db_order.amount, rate)
    
    order_dict = {
        "id": db_order.id,
        "customer_name": db_order.customer_name,
        "amount": db_order.amount,
        "status": db_order.status,
        "created_at": db_order.created_at,
        "amount_usd": amount_usd
    }
    order_data = OrderResponse(**order_dict)
    
    # Broadcast updated order to all connected WebSockets
    await manager.broadcast({
        "event": "order_status_updated",
        "data": order_data.model_dump() if hasattr(order_data, "model_dump") else order_data.dict()
    })
    
    return APIResponse(
        success=True,
        message=f"Order status updated to {payload.status}",
        data=order_data
    )

@router.delete("/{order_id}", response_model=APIResponse)
async def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an order by its ID."""
    db_order = db.query(Order).filter(Order.id == order_id).first()
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
        
    try:
        db.delete(db_order)
        db.commit()
        
        # Broadcast deletion to all connected websockets (so dashboard UI updates instantly)
        await manager.broadcast({
            "event": "order_deleted",
            "data": {"id": order_id}
        })
        
        return APIResponse(
            success=True,
            message="Order deleted successfully",
            data={"id": order_id}
        )
    except Exception as err:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database delete failed: {str(err)}"
        )
