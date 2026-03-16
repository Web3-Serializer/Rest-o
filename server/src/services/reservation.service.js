import Reservation from '../models/Reservation.js';

export const getAllReservations = async (filters = {}) => {
  const query = { ...filters };

  if (filters.date) {
    const startDate = new Date(filters.date);
    const endDate = new Date(filters.date);
    endDate.setDate(endDate.getDate() + 1);
    query.date = { $gte: startDate, $lt: endDate };
  }

  return await Reservation.find(query)
    .populate('createdBy', 'name email')
    .sort({ date: 1, time: 1 });
};

export const getReservationById = async (id) => {
  const reservation = await Reservation.findById(id).populate('createdBy', 'name email');
  if (!reservation) throw new Error('Reservation not found');
  return reservation;
};

export const createReservation = async (reservationData, userId) => {
  return await Reservation.create({ ...reservationData, createdBy: userId });
};

export const updateReservation = async (id, reservationData) => {
  const reservation = await Reservation.findByIdAndUpdate(
    id,
    reservationData,
    { new: true, runValidators: true }
  );
  if (!reservation) throw new Error('Reservation not found');
  return reservation;
};

export const deleteReservation = async (id) => {
  const reservation = await Reservation.findByIdAndDelete(id);
  if (!reservation) throw new Error('Reservation not found');
  return reservation;
};