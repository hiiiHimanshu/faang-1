import { Router } from 'express';
import weatherRoutes from './weather.routes';
import forecastRoutes from './forecast.routes';
import locationsRoutes from './locations.routes';
import healthRoutes from './health.routes';

const router = Router();

// Mount route modules
router.use('/weather', weatherRoutes);
router.use('/weather', forecastRoutes);
router.use('/locations', locationsRoutes);
router.use('/', healthRoutes);

export default router;