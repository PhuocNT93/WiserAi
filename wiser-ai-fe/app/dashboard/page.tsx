'use client';

import * as React from 'react';
import GrowthMapDashboard from '@/components/career-plan/GrowthMapDashboard';
import { getLatestPlan, transformPlanToGrowthMap, GrowthMapData } from '@/lib/api/careerPlan';

export default function DashboardPage() {
    const [growthMapData, setGrowthMapData] = React.useState<GrowthMapData | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadGrowthMap();
    }, []);

    const loadGrowthMap = async () => {
        try {
            setLoading(true);
            // Fetch latest career plan from database
            const latestPlan = await getLatestPlan();
            const data = transformPlanToGrowthMap(latestPlan);
            setGrowthMapData(data);
        } catch (err) {
            console.error('Failed to load growth map:', err);
        } finally {
            setLoading(false);
        }
    };

    return <GrowthMapDashboard data={growthMapData} loading={loading} />;
}

