import showService from '../services/show.service.js';

export const getShows = async (req, res, next) => {
  try {
    const shows = await showService.listShows(req.query);
    res.status(200).json({
      success: true,
      data: shows,
    });
  } catch (error) {
    next(error);
  }
};

export const getShow = async (req, res, next) => {
  try {
    const result = await showService.getShowById(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createShow = async (req, res, next) => {
  try {
    const show = await showService.createShow(req.body);
    res.status(201).json({
      success: true,
      message: 'Show created successfully',
      data: show,
    });
  } catch (error) {
    next(error);
  }
};

export const lockShowSeats = async (req, res, next) => {
  try {
    const { seatIds } = req.body;
    const result = await showService.lockSeats(req.params.id, seatIds, req.user.id);

    // If socket.io is available on req.app, emit real-time event
    const io = req.app.get('io');
    if (io) {
      io.to(`show:${req.params.id}`).emit('seats:locked', {
        showId: req.params.id,
        seatIds,
        lockedUntil: result.lockedUntil,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Seats held successfully for checkout',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const releaseShowSeats = async (req, res, next) => {
  try {
    const { seatIds } = req.body;
    const result = await showService.releaseSeats(req.params.id, seatIds, req.user.id);

    const io = req.app.get('io');
    if (io) {
      io.to(`show:${req.params.id}`).emit('seats:released', {
        showId: req.params.id,
        seatIds,
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteShow = async (req, res, next) => {
  try {
    const show = await showService.deleteShow(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Show deleted successfully',
      data: show,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getShows,
  getShow,
  createShow,
  lockShowSeats,
  releaseShowSeats,
  deleteShow,
};
