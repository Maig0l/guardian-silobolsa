import { Router, Request, Response } from 'express';
import { AlertaService } from '../services/AlertaService';

const router: Router = Router();

// GET /api/alertas - Get all alertas
router.get('/', async (_req: Request, res: Response) => {
  const alertaService = new AlertaService();
  try {
    const alertas = await alertaService.getAllAlertas();
    res.json({
      success: true,
      data: alertas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/alertas/active - Get active alertas
router.get('/active', async (_req: Request, res: Response) => {
  const alertaService = new AlertaService();
  try {
    const alertas = await alertaService.getActiveAlertas();
    res.json({
      success: true,
      data: alertas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/alertas/:id - Get alerta by id
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  const alertaService = new AlertaService();
  try {
    const alerta = await alertaService.getAlertaById(parseInt(req.params.id));
    if (!alerta) {
      return res.status(404).json({
        success: false,
        error: 'Alerta not found'
      });
    }
    res.json({
      success: true,
      data: alerta
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/alertas - Create new alerta
router.post('/', async (req: Request, res: Response) => {
  const alertaService = new AlertaService();
  try {
    const alerta = await alertaService.createAlerta(req.body);
    res.status(201).json({
      success: true,
      data: alerta
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/alertas/:id/resolve - Resolve alerta
router.put('/:id/resolve', async (req: Request, res: Response): Promise<any> => {
  const alertaService = new AlertaService();
  try {
    const alerta = await alertaService.resolveAlerta(parseInt(req.params.id));
    if (!alerta) {
      return res.status(404).json({
        success: false,
        error: 'Alerta not found'
      });
    }
    res.json({
      success: true,
      data: alerta
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
