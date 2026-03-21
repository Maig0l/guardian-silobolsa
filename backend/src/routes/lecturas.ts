import { Router, Request, Response } from 'express';
import { LecturaService } from '../services/LecturaService';

const router: Router = Router();

// GET /api/lecturas - Get all lecturas
router.get('/', async (_req: Request, res: Response) => {
  const lecturaService = new LecturaService();
  try {
    const lecturas = await lecturaService.getAllLecturas();
    res.json({
      success: true,
      data: lecturas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/lecturas/:id - Get lectura by id
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  const lecturaService = new LecturaService();
  try {
    const lectura = await lecturaService.getLecturaById(parseInt(req.params.id));
    if (!lectura) {
      return res.status(404).json({
        success: false,
        error: 'Lectura not found'
      });
    }
    res.json({
      success: true,
      data: lectura
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/lecturas/sensor/:sensorId - Get lecturas by sensor
router.get('/sensor/:sensorId', async (req: Request, res: Response) => {
  const lecturaService = new LecturaService();
  try {
    const sensorId = parseInt(req.params.sensorId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const lecturas = await lecturaService.getLecturasBySensor(sensorId, limit);
    res.json({
      success: true,
      data: lecturas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/lecturas/alerts - Get lecturas with alerts
router.get('/alerts', async (_req: Request, res: Response) => {
  const lecturaService = new LecturaService();
  try {
    const lecturas = await lecturaService.getAlertLecturas();
    res.json({
      success: true,
      data: lecturas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/lecturas - Create new lectura
router.post('/', async (req: Request, res: Response) => {
  const lecturaService = new LecturaService();
  try {
    const lectura = await lecturaService.createLectura(req.body);
    res.status(201).json({
      success: true,
      data: lectura
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
