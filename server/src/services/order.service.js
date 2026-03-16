import Order from '../models/Order.js';
import Menu from '../models/Menu.js';

export const getAllOrders = async (filters = {}) => {
  const query = { ...filters };

  if (filters.date) {
    const startDate = new Date(filters.date);
    const endDate = new Date(filters.date);
    endDate.setDate(endDate.getDate() + 1);
    query.date = { $gte: startDate, $lt: endDate };
  }

  return await Order.find(query)
    .populate('items.menu')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });
};

export const getOrderById = async (id) => {
  const order = await Order.findById(id)
    .populate('items.menu')
    .populate('createdBy', 'name email');
  if (!order) throw new Error('Order not found');
  return order;
};

export const createOrder = async (orderData, userId) => {
  if (!orderData.items || !orderData.items.length) {
    throw new Error('Order must have at least one item');
  }

  const menuIds = orderData.items.map(i => i.menu.toString());
  const menuItems = await Menu.find({ _id: { $in: menuIds }, isAvailable: true });

  if (menuItems.length !== orderData.items.length) {
    throw new Error('Some menu items are invalid or unavailable');
  }

  const validatedItems = orderData.items.map(item => {
    const matchedMenu = menuItems.find(m => m._id.toString() === item.menu.toString());
    if (!matchedMenu) throw new Error(`Menu item not found: ${item.menu}`);
    if (!item.quantity || item.quantity <= 0) throw new Error(`Invalid quantity for menu item: ${item.menu}`);

    return {
      menu: matchedMenu._id,
      name: matchedMenu.name,
      quantity: item.quantity,
      price: matchedMenu.price,
      total: matchedMenu.price * item.quantity
    };
  });

  const totalAmount = validatedItems.reduce((sum, i) => sum + i.total, 0);

  if (!orderData.tableNumber) throw new Error('Table number is required');

  return await Order.create({
    items: validatedItems,
    totalAmount,
    customerName: orderData.customerName || undefined,
    tableNumber: orderData.tableNumber,
    notes: orderData.notes || undefined,
    createdBy: userId
  });
};

export const updateOrderStatus = async (id, status) => {
  const order = await Order.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );
  if (!order) throw new Error('Order not found');
  return order;
};

export const deleteOrder = async (id) => {
  const order = await Order.findByIdAndDelete(id);
  if (!order) throw new Error('Order not found');
  return order;
};