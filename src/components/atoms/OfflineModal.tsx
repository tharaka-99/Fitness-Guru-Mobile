import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { theme } from '@utils/styles/theme';
import Box from '@components/atoms/Box';

interface OfflineModalProps {
    isVisible: boolean;
    onRetry: () => void;
}

const OfflineModal: React.FC<OfflineModalProps> = ({ isVisible, onRetry }) => {
    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="fade"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <Box
                    backgroundColor="PrimaryGrey"
                    padding="xl"
                    borderRadius="lg"
                    alignItems="center"
                    width="85%"
                    style={styles.container}
                >
                    <WifiOff size={64} color={theme.colors.PrimaryGreen} />
                    <Text style={styles.title}>Connection Lost</Text>
                    <Text style={styles.description}>
                        It looks like you're offline. Please check your internet connection to continue using Fitness Guru.
                    </Text>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={onRetry}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Retry Connection</Text>
                    </TouchableOpacity>
                </Box>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginTop: 20,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#D9D9D9',
        marginTop: 12,
        marginBottom: 30,
        textAlign: 'center',
        lineHeight: 22,
    },
    button: {
        backgroundColor: theme.colors.PrimaryGreen,
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
    },
    buttonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default OfflineModal;
