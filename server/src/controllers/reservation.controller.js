import * as reservationService from '../services/reservation.service.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getAll = async (req, res) => {
  try {
    const reservations = await reservationService.getAllReservations(req.query);
    successResponse(res, { reservations }, 'Reservations retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const getById = async (req, res) => {
  try {
    const reservation = await reservationService.getReservationById(req.params.id);
    successResponse(res, { reservation }, 'Reservation retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message, 404);
  }
};

export const getMyReservations = async (req, res) => {
  try {
    const reservations = await reservationService.getAllReservations({ createdBy: req.user._id });
    successResponse(res, { reservations }, 'Your reservations retrieved successfully');
  } catch (error) {
    errorResponse(res, error.message);
  }
};

export const create = async (req, res) => {
  try {
    const reservation = await reservationService.createReservation(req.body, req.user._id);
    successResponse(res, { reservation }, 'Reservation created successfully', 201);
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

export const update = async (req, res) => {
  try {
    const reservation = await reservationService.updateReservation(req.params.id, req.body);
    successResponse(res, { reservation }, 'Reservation updated successfully');
  } catch (error) {
    errorResponse(res, error.message, 400);
  }
};

export const remove = async (req, res) => {
  try {
    await reservationService.deleteReservation(req.params.id);
    successResponse(res, null, 'Reservation deleted successfully');
  } catch (error) {
    errorResponse(res, error.message, 404);
  }
};