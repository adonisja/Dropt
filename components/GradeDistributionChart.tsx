import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, useWindowDimensions, Platform } from 'react-native';
import { useTheme } from '@/lib/theme/theme-context';
import { Skia, Canvas, Rect, LinearGradient, vec, Paint } from '@shopify/react-native-skia';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';

interface DataPoint {
    label: string; // e.g., A, B, C
    value: number; // e.g., percentage of students
}

interface GradeDistributionChartProps {
    data: DataPoint[];
}

export default function GradeDistributionChart({data}: GradeDistributionChartProps) {
    const { width } = useWindowDimensions(); // destructure the window width from the os
    const { hexColors } = useTheme();
    const CHART_HEIGHT = 200; // Set a max height for the chart
    const PADDING = 20;
    const GRAPH_WIDTH = width - 48; // padding from parent container
    const [isSkiaReady, setIsSkiaReady] = useState(Platform.OS !== 'web');
    const [loadError, setLoadError] = useState(Platform.OS === 'web');

    // Create a Scales (The Math)

    // Mapping the "Data Domain" (0-max value) to "Screen Range" (height to 0)...basically ensuring the graph scales to the container
    const yScale = useMemo(() => {
        if (!data || data.length === 0) {
            // Return a default scale if there's no data
            return d3Scale.scaleLinear()
                .domain([0, 10]) // Default domain
                .range([CHART_HEIGHT - PADDING, PADDING]); // Inverted because Y=0 is top
        }

        const values = data.map(d => d.value);
        const maxVal = Math.max(...values);

        // Handle -Infinity (empty array) or Infinity
        if (!isFinite(maxVal)) {
             return d3Scale.scaleLinear()
                .domain([0, 10])
                .range([CHART_HEIGHT - PADDING, PADDING]);
        }

        // Ensure maxVal is at least 1 to avoid zero range
        const safeMaxVal = maxVal === 0 ? 10 : maxVal;
        return d3Scale.scaleLinear()
            .domain([0, safeMaxVal])
            .range([CHART_HEIGHT - PADDING, PADDING]); // Inverted because Y=0 is top
    }, [data]);

    // Map the "Data Domain" (categories) to "Screen Range" (0 to width)
    const xScale = useMemo(() => {
        return d3Scale.scaleBand()
            .domain(data.map(d => d.label))
            .range([PADDING, GRAPH_WIDTH - PADDING])
            .padding(0.3);
    }, [data, GRAPH_WIDTH]);

    if (loadError) {
        // Fallback for Web if Skia fails to load
        const maxVal = Math.max(...data.map(d => d.value));
        const hasData = maxVal > 0;

        return (
            <View className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: hexColors.card, borderWidth: 1, borderColor: hexColors.border }}>
                <Text className="text-lg font-bold mb-4" style={{ color: hexColors.foreground }}>Grade Distribution</Text>
                <View style={{ height: 200, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: 20 }}>
                    {data.map((point, index) => {
                        const heightPercent = hasData ? (point.value / maxVal) * 100 : 20;
                        const displayValue = point.value;

                        return (
                            <View key={index} style={{ alignItems: 'center', flex: 1 }}>
                                <Text className="text-xs font-semibold mb-1" style={{ color: hexColors.primary }}>
                                    {displayValue}
                                </Text>
                                <View style={{
                                    width: 40,
                                    height: `${heightPercent}%`,
                                    backgroundColor: '#3B82F6',
                                    borderRadius: 6,
                                    minHeight: 10,
                                    opacity: hasData ? 1 : 0.3
                                }} />
                                <Text className="text-sm font-medium mt-2" style={{ color: hexColors.foreground }}>{point.label}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    }

    if (!isSkiaReady) {
        return (
            <View className="rounded-2xl p-4 shadow-sm h-[200px] items-center justify-center" style={{ backgroundColor: hexColors.card, borderWidth: 1, borderColor: hexColors.border }}>
                <Text style={{ color: hexColors.mutedForeground }}>Loading Chart...</Text>
            </View>
        );
    }

    return (
        <View className="rounded-2xl p-4 shadow-sm" style={{ backgroundColor: hexColors.card, borderWidth: 1, borderColor: hexColors.border }}>
            <Text className="text-lg font-bold mb-4" style={{ color: hexColors.foreground }}>Grade Distribution</Text>

            <Canvas style={{ width: GRAPH_WIDTH, height: CHART_HEIGHT }}>
                {data.map((point, index) => {
                    const y = yScale(point.value); // Get y position (top of the bar)
                    const x = xScale(point.label) || 0; // Get x position
                    const barHeight = (CHART_HEIGHT - PADDING) - y; // Calculate height relative to baseline

                    return(
                        <Rect
                            key={index}
                            x={x}
                            y={y}
                            width={xScale.bandwidth()}
                            height={barHeight}
                            color="#3B82F6"
                        />
                    );
                })}
            </Canvas>

            {/* Labels below the chart */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 }}>
                {data.map((point, index) => (
                    <Text key={index} className="text-sm font-medium" style={{ flex: 1, textAlign: 'center', color: hexColors.foreground }}>
                        {point.label}
                    </Text>
                ))}
            </View>
        </View>
    );
}