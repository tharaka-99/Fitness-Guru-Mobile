import React, { useState, useEffect } from 'react';
import { ImageBackground, StyleSheet, Dimensions, TouchableOpacity, ScrollView, SafeAreaView, Linking, Image, Share, View } from 'react-native';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { theme } from '@utils/styles/theme';

const { width } = Dimensions.get('window');

interface CountdownGateProps {
    launchDate: Date;
    onLaunch: () => void;
    onBypass: () => void;
}

const CountdownGate: React.FC<CountdownGateProps> = ({ launchDate, onLaunch, onBypass }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const distance = launchDate.getTime() - now;

            if (distance <= 0) {
                onLaunch();
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            } else {
                return {
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000)
                };
            }
        };

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [launchDate, onLaunch]);

    const openLink = (url: string) => {
        Linking.openURL(url).catch((err) =>
            console.error("Failed to open URL", err)
        );
    };


    const addLeadingZero = (value: number) => (value < 10 ? `0${value}` : value.toString());

    const handleInvite = async () => {
        try {
            await Share.share({
                message: 'Join me on Fitness Guru! The next evolution of fitness in Sri Lanka is launching soon. Check it out: https://fitnessgurulk.com',
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <ImageBackground
            source={require('assets/images/countdown_bg_image.png')}
            style={styles.background}
            resizeMode="cover"
        >

            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <Box alignItems="center">
                        <Image
                            source={require('assets/images/FG_Banner_Logo_01.png')}
                            style={{ width: "60%", height: 50, marginRight: 10 }}
                            resizeMode="contain"
                        />
                        <Text variant="md" color="textSecondary">Revolutionising Fitness in Sri Lanka</Text>
                    </Box>


                    <Box alignItems="center" mt="xl">
                        <Text variant="2xlBold" color="textPrimary" textAlign="center" style={styles.mainTitle}>Best Version of Yourself</Text>
                        <Text variant="md" color="textPrimary" mt="xs">Unlocks in</Text>
                    </Box>


                    <Box
                        borderRadius="lg"
                        p="md"
                        mt="xl"
                        flexDirection="row"
                        justifyContent="space-around"
                        style={styles.countdownContainer}
                    >
                        <Box alignItems="center" flex={1}>
                            <Text variant="2xlBold" color="PrimaryGreen">{addLeadingZero(timeLeft.days)}</Text>
                            <Text variant="xs" color="textSecondary">Days</Text>
                        </Box>
                        <Box width={1} backgroundColor="PrimaryGreyDark" height="100%" />
                        <Box alignItems="center" flex={1}>
                            <Text variant="2xlBold" color="PrimaryGreen">{addLeadingZero(timeLeft.hours)}</Text>
                            <Text variant="xs" color="textSecondary">Hours</Text>
                        </Box>
                        <Box width={1} backgroundColor="PrimaryGreyDark" height="100%" />
                        <Box alignItems="center" flex={1}>
                            <Text variant="2xlBold" color="PrimaryGreen">{addLeadingZero(timeLeft.minutes)}</Text>
                            <Text variant="xs" color="textSecondary">Mins</Text>
                        </Box>
                        <Box width={1} backgroundColor="PrimaryGreyDark" height="100%" />
                        <Box alignItems="center" flex={1}>
                            <Text variant="2xlBold" color="PrimaryGreen">{addLeadingZero(timeLeft.seconds)}</Text>
                            <Text variant="xs" color="textSecondary">Secs</Text>
                        </Box>
                    </Box>

                    <Box alignItems="center" mt="md">
                        <Text variant="lgBold" color="PrimaryGreen">Launching March 28</Text>
                    </Box>


                    <TouchableOpacity
                        onPress={onBypass}
                        activeOpacity={0.8}
                        style={{ borderWidth: 1, borderColor: theme.colors.PrimaryGreen, borderRadius: theme.borderRadii.md, marginTop: theme.spacing.xl, alignSelf: 'center', paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm }}
                    >

                        <Text variant="sm" color="textPrimary">Early Member Access</Text>

                    </TouchableOpacity>

                    <Box px="md" mt="md">
                        <Text variant="sm" color="textSecondary" textAlign="center" lineHeight={22}>
                            Be among the first to experience the next evolution of fitness in Sri Lanka. A smarter way to train, eat, and transform your body.
                        </Text>
                    </Box>

                    <Box mt="3xl" px="md">
                        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8} onPress={handleInvite}>
                            <Text variant="md" color="textPrimaryBlack">Invite a Friend</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.outlineButton}
                            activeOpacity={0.7}
                            onPress={() => Linking.openURL('https://www.instagram.com/fitnessguruapp')}
                        >
                            <Text variant="md" color="textPrimary">Follow Us on Instagram</Text>
                        </TouchableOpacity>
                    </Box>

                    <TouchableOpacity style={{ marginTop: 24, paddingBottom: 40 }} activeOpacity={0.7}

                        onPress={() =>
                            openLink("https://www.fitnessgurulk.com/term-conditions")
                        }>
                        <Text variant="xs" color="textSecondary" textAlign="center">Terms & Conditions</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>

        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
        paddingVertical: 40,
    },
    mainTitle: {
        fontSize: 28,
        letterSpacing: 0.5,
    },
    countdownContainer: {
        backgroundColor: 'rgba(29,29,29,0.8)',
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.5)',
        marginHorizontal: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 5,
    },
    primaryButton: {
        backgroundColor: theme.colors.PrimaryGreen,
        height: theme.spacing['2xl'],
        borderRadius: theme.borderRadii.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        shadowColor: theme.colors.PrimaryGreen,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    outlineButton: {
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        height: theme.spacing['2xl'],
        borderRadius: theme.borderRadii.full,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    }
});

export default CountdownGate;
