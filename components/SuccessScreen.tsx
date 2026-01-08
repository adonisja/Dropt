import { View, Text, StyleSheet } from 'react-native';
import { ReactNode } from 'react';
import { useTheme } from '@/lib/theme/theme-context';
import PlatformButton from './PlatformButton';

interface SuccessAction {
    label: string;
    onPress: () => void;
    primary?: boolean;
}

interface SuccessScreenProps {
    title: string;
    message: string;
    actions: SuccessAction[];
    icon?: ReactNode;
}

/**
 * Displays a success completion screen with customizable actions
 */
export default function SuccessScreen({
    title,
    message,
    actions,
    icon,
}: SuccessScreenProps) {
    const { theme, hexColors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <View style={styles.content}>
                {icon || (
                    <View style={[styles.iconCircle, { backgroundColor: theme.colors.success }]}>
                        <Text style={[styles.iconText, { color: theme.colors.successForeground }]}>✓</Text>
                    </View>
                )}

                <Text style={[styles.title, { color: theme.colors.foreground }]}>{title}</Text>
                <Text style={[styles.message, { color: theme.colors.mutedForeground }]}>{message}</Text>
            </View>

            <View style={styles.actionsContainer}>
                {actions.map((action, index) => (
                    <View key={index} style={styles.actionWrapper}>
                        <PlatformButton
                            onPress={action.onPress}
                            style={[
                                styles.actionButton,
                                action.primary
                                    ? { backgroundColor: theme.colors.primary }
                                    : {
                                        backgroundColor: theme.colors.card,
                                        borderWidth: 1,
                                        borderColor: theme.colors.border
                                    }
                            ]}
                        >
                            <Text style={[
                                styles.actionButtonText,
                                {
                                    color: action.primary
                                        ? theme.colors.primaryForeground
                                        : theme.colors.foreground
                                }
                            ]}>
                                {action.label}
                            </Text>
                        </PlatformButton>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    content: {
        alignItems: 'center',
        marginBottom: 40,
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    iconText: {
        fontSize: 36,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    actionsContainer: {
        width: '100%',
    },
    actionWrapper: {
        marginBottom: 12,
    },
    actionButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});
