import { StatisticsData } from '@/types/Statistics';
import endpoint from './endpoint.constant';
import { instance } from '@/lib/axioos';

const statisticsService = {
    list: (params?: Record<string, any>) =>
        instance.get(`${endpoint.STATISTICS}`, { params }).then((res) => res.data as StatisticsData),

}

export default statisticsService;