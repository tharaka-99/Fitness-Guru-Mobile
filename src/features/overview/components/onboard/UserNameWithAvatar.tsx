import React from 'react';
import { Image } from 'react-native';

import { store } from '@/store';
import Box from '@components/atoms/Box';
import Text from '@components/atoms/Text';
import { theme } from '@utils/styles/theme';
import { UserAvatarRounded } from '@components/app/UserAvatar';

const UserNameWithAvatar: React.FC = () => {
  const { user } = store.getState()['feature/auth'];

  return (
    <Box flexDirection="row" gap="sm" alignItems="center">
      {user?.profileImageFileUrl ? (
        <Image
          resizeMode="cover"
          source={{ uri: user?.profileImageFileUrl }}
          style={{
            width: 35,
            height: 35,
            borderRadius: theme.borderRadii.full,
          }}
        />
      ) : (
        <Box>{UserAvatarRounded(user?.firstName + ' ' + user?.lastName)}</Box>
      )}

      <Text variant="lgBold" textTransform="uppercase" numberOfLines={1}>
        {user ? user?.firstName + ' ' + user?.lastName : ''}
      </Text>
    </Box>
  );
};

export default UserNameWithAvatar;

const sampleImage =
  'https://images.unsplash.com/photo-1615109398623-88346a601842?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
