import User from '../models/User.js';
import Menu from '../models/Menu.js';
import Order from '../models/Order.js';
import Reservation from '../models/Reservation.js';

export const getStats = async (req, res) => {
  try {
    const user = req.user;

    let data = {};

    if (user.role === 'admin') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [
        users, 
        previousUsers,
        menus, 
        orders, 
        previousOrders,
        reservations, 
        previousReservations,
        orderStatus,
        monthlyRevenue,
        userGrowth,
        popularMenus
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ createdAt: { $lt: thirtyDaysAgo } }),
        Menu.countDocuments(),
        Order.find(),
        Order.find({ createdAt: { $lt: thirtyDaysAgo } }),
        Reservation.countDocuments(),
        Reservation.countDocuments({ createdAt: { $lt: thirtyDaysAgo } }),
        Order.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        Order.aggregate([
          {
            $group: {
              _id: { 
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              revenue: { $sum: '$totalAmount' },
              orders: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]),
        User.aggregate([
          {
            $group: {
              _id: { 
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]),
        Order.aggregate([
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.menu',
              quantity: { $sum: '$items.quantity' },
              revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
            }
          },
          { $sort: { quantity: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'menus',
              localField: '_id',
              foreignField: '_id',
              as: 'menuDetails'
            }
          },
          {
            $project: {
              name: { $arrayElemAt: ['$menuDetails.name', 0] },
              quantity: 1,
              revenue: 1,
              orders: 1
            }
          }
        ])
      ]);

      const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const previousTotalRevenue = previousOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      const orderStatusMap = {};
      orderStatus.forEach(item => {
        orderStatusMap[item._id] = item.count;
      });

      const monthlyRevenueFormatted = monthlyRevenue.map(item => ({
        month: `${item._id.year}-${item._id.month}`,
        revenue: item.revenue,
        orders: item.orders
      }));

      const userGrowthFormatted = userGrowth.map(item => ({
        month: `${item._id.year}-${item._id.month}`,
        count: item.count
      }));

      data = {
        totalUsers: users,
        totalMenus: menus,
        totalOrders: orders.length,
        totalReservations: reservations,
        totalRevenue,
        previousPeriod: {
          users: previousUsers,
          orders: previousOrders.length,
          reservations: previousReservations,
          totalRevenue: previousTotalRevenue
        },
        orderStatus: orderStatusMap,
        monthlyRevenue: monthlyRevenueFormatted,
        userGrowth: userGrowthFormatted,
        popularMenus
      };
    } 
    else if (user.role === 'manager') {
      const [menus, orders, reservations] = await Promise.all([
        Menu.countDocuments(),
        Order.find(),
        Reservation.countDocuments(),
      ]);

      const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      data = {
        totalMenus: menus,
        totalOrders: orders.length,
        totalReservations: reservations,
        totalRevenue,
      };
    } 
    else if (user.role === 'staff') {
      const [pendingOrders, preparingOrders, readyOrders, reservations] = await Promise.all([
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments({ status: 'preparing' }),
        Order.countDocuments({ status: 'ready' }),
        Reservation.countDocuments({ status: { $in: ['pending', 'confirmed'] } }),
      ]);

      data = {
        pendingOrders,
        preparingOrders,
        readyOrders,
        activeReservations: reservations,
      };
    } 
    else if (user.role === 'user') {
      const [orders, reservations] = await Promise.all([
        Order.countDocuments({ createdBy: user._id }),
        Reservation.countDocuments({ createdBy: user._id }),
      ]);

      data = {
        myOrders: orders,
        myReservations: reservations,
      };
    }

    res.json({
      success: true,
      message: 'Statistics retrieved successfully',
      data,
    });
  } catch (err) {
    console.error('Error getting stats:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to retrieve statistics',
    });
  }
};