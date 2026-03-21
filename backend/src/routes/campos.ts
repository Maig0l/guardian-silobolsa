import { Router, Request, Response } from 'express';
import { CampoService } from '../services/CampoService';

const router: Router = Router();

// GET /api/campos - Get all campos
router.get('/', async (_req: Request, res: Response) => {
  const campoService = new CampoService();
  try {
    const campos = await campoService.getAllCampos();
    res.json({
      success: true,
      data: campos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/campos/:id - Get campo by id
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
  const campoService = new CampoService();
  try {
    const campo = await campoService.getCampoById(parseInt(req.params.id));
    if (!campo) {
      return res.status(404).json({
        success: false,
        error: 'Campo not found'
      });
    }
    res.json({
      success: true,
      data: campo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/campos - Create new campo
router.post('/', async (req: Request, res: Response) => {
  const campoService = new CampoService();
  try {
    const campo = await campoService.createCampo(req.body);
    res.status(201).json({
      success: true,
      data: campo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/campos/:id - Update campo
router.put('/:id', async (req: Request, res: Response): Promise<any> => {
  const campoService = new CampoService();
  try {
    const campo = await campoService.updateCampo(parseInt(req.params.id), req.body);
    if (!campo) {
      return res.status(404).json({
        success: false,
        error: 'Campo not found'
      });
    }
    res.json({
      success: true,
      data: campo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/campos/:id - Delete campo (soft delete)
router.delete('/:id', async (req: Request, res: Response): Promise<any> => {
  const campoService = new CampoService();
  try {
    const campo = await campoService.deleteCampo(parseInt(req.params.id));
    if (!campo) {
      return res.status(404).json({
        success: false,
        error: 'Campo not found'
      });
    }
    res.json({
      success: true,
      data: campo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
