import { View, Text, StyleSheet } from 'react-native';

interface FormErrorProps {
    message: string | null;
}

/**
 * Displays form validation errors inline
 * Shows a red error message box when message is provided
 */
export default function FormError({ message }: FormErrorProps) {
    if (!message) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.text}>{message}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFEBEE',
        borderWidth: 1,
        borderColor: '#F44336',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    text: {
        color: '#C62828',
        fontSize: 14,
        textAlign: 'center',
    },
});
