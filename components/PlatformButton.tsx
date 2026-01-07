import {
    TouchableOpacity,
    Pressable,
    Platform,
    StyleProp,
    ViewStyle,
    GestureResponderEvent,
} from 'react-native';
import { ReactNode } from 'react';

interface PlatformButtonProps {
    onPress: (event: GestureResponderEvent) => void;
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
    children: ReactNode;
}

/**
 * Platform-aware button component
 * Uses Pressable on web (better click handling) and TouchableOpacity on native (better touch feedback)
 */
export default function PlatformButton({
    onPress,
    style,
    disabled,
    children,
}: PlatformButtonProps) {
    if (Platform.OS === 'web') {
        return (
            <Pressable
                onPress={onPress}
                style={style}
                disabled={disabled}
            >
                {children}
            </Pressable>
        );
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            style={style}
            disabled={disabled}
            activeOpacity={0.7}
        >
            {children}
        </TouchableOpacity>
    );
}
