import { Router, Request, Response } from 'express';
import { SensorService } from '../services/SensorService';

const router = Router();
const sensorService = new SensorService();

// GET /api/sensores - Get all sensores
router.get('/', async (req: Request, res: Response) => {
  try {
    const sensores = await sensorService.getAllSensores();
    res.json({
      success: true,
      data: sensores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/sensores/:id - Get sensor by id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const sensor = await sensorService.getSensorById(parseInt(req.params.id));
    if (!sensor) {
      return res.status(404).json({
        success: false,
        error: 'Sensor not found'
      });
    }
    res.json({
      success: true,
      data: sensor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sensores - Create new sensor
router.post('/', async (req: Request, res: Response) => {
  try {
    const sensor = await sensorService.createSensor(req.body);
    res.status(201).json({
      success: true,
      data: sensor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/sensores/:id - Update sensor
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const sensor = await sensorService.updateSensor(parseInt(req.params.id), req.body);
    if (!sensor) {
      return res.status(404).json({
        success: false,
        error: 'Sensor not found'
      });
    }
    res.json({
      success: true,
      data: sensor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/sensores/:id - Delete sensor (soft delete)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const sensor = await sensorService.deleteSensor(parseInt(req.params.id));
    if (!sensor) {
      return res.status(404).json({
        success: false,
        error: 'Sensor not found'
      });
    }
    res.json({
      success: true,
      data: sensor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

module.exports = router;
