import { X, Upload } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, Image, TouchableOpacity } from 'react-native';

import Box from '@components/atoms/Box';
import InputLabel from '@components/atoms/InputLabel';
import Text from '@components/atoms/Text';
import { theme } from '@utils/styles/theme';

export interface ImageInputProps {
  onImageUpload?: (images: string[]) => void;
  selectionLimit?: number;
  label?: string;
}

const ImageInput: React.FC<ImageInputProps> = ({
  label,
  onImageUpload,
  selectionLimit = 1,
}) => {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (onImageUpload) onImageUpload(images);
  }, [images]);

  const handleImageUpload = async () => {
    Alert.alert(
      'Choose an Option',
      'Would you like to take a photo or choose from the gallery?',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const permission =
              await ImagePicker.requestCameraPermissionsAsync();
            if (permission.granted) {
              const result = await ImagePicker.launchCameraAsync({
                quality: 1,
                allowsEditing: true,
                mediaTypes: 'images',
              });
              if (!result.canceled) {
                setImages((prev) => [...prev, result.assets[0].uri]);
              }
            } else {
              Alert.alert('Camera permission is required to take a photo.');
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const permission =
              await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permission.granted) {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                allowsMultipleSelection: true,
                selectionLimit: selectionLimit - images.length,
                quality: 1,
              });
              if (!result.canceled) {
                const selectedUris = result.assets.map((image) => image.uri);
                setImages((prev) => [...prev, ...selectedUris]);
              }
            } else {
              Alert.alert('Gallery permission is required to upload photos.');
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleImageRemove = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <Box gap="sm">
      {label && <InputLabel label={label} />}

      <Box p="base" borderRadius="xs" backgroundColor="backgroundSecondary">
        {!!images.length && (
          <Box
            p="sm"
            borderWidth={1}
            borderRadius="xs"
            borderStyle="dashed"
            borderColor="textSecondary"
          >
            <Box
              p="sm"
              gap="base"
              flexWrap="wrap"
              alignItems="center"
              flexDirection="row"
              justifyContent="center"
            >
              {images.map((imgUri, idx) => (
                <Box key={String(idx)} position="relative">
                  <Image
                    source={{ uri: imgUri }}
                    resizeMode="cover"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: theme.borderRadii.xs,
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => handleImageRemove(idx)}
                    style={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      backgroundColor: theme.colors.PrimaryRed,
                      borderRadius: 12,
                      padding: 4,
                    }}
                  >
                    <X
                      size={16}
                      color={theme.colors.PrimaryWhite}
                    />
                  </TouchableOpacity>
                </Box>
              ))}
            </Box>

            <Text textAlign="right" color="textSecondary">
              {images.length} / {selectionLimit}
            </Text>
          </Box>
        )}

        {images.length < selectionLimit && (
          <TouchableOpacity onPress={handleImageUpload}>
            <Box
              p="base"
              height={120}
              borderWidth={1}
              borderRadius="xs"
              alignItems="center"
              borderStyle="dashed"
              justifyContent="center"
              borderColor="textSecondary"
            >
              <Box justifyContent="center" alignItems="center" gap="xs">
                <Upload
                  size={20}
                  color={theme.colors.textSecondary}
                />
                <Text color="textSecondary">Upload</Text>
              </Box>
            </Box>
          </TouchableOpacity>
        )}
      </Box>
    </Box>
  );
};

export default ImageInput;
