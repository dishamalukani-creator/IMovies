import theatreService from '../services/theatre.service.js';

export const getTheatres = async (req, res, next) => {
  try {
    const theatres = await theatreService.listTheatres(req.query);
    res.status(200).json({
      success: true,
      data: theatres,
    });
  } catch (error) {
    next(error);
  }
};

export const getTheatre = async (req, res, next) => {
  try {
    const result = await theatreService.getTheatreById(req.params.id);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createTheatre = async (req, res, next) => {
  try {
    const theatre = await theatreService.createTheatre(req.body);
    res.status(201).json({
      success: true,
      message: 'Theatre created successfully',
      data: theatre,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTheatre = async (req, res, next) => {
  try {
    const theatre = await theatreService.updateTheatre(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Theatre updated successfully',
      data: theatre,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTheatre = async (req, res, next) => {
  try {
    const theatre = await theatreService.deleteTheatre(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Theatre deleted successfully',
      data: theatre,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getTheatres,
  getTheatre,
  createTheatre,
  updateTheatre,
  deleteTheatre,
};
