import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

interface ImagePreviewListProps {
  images: { uri: string }[];
}

const ImagePreviewList: React.FC<ImagePreviewListProps> = ({ images }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {images.length > 0 ? (
        <View style={styles.previewContainer}>
          {images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image.uri }}
              style={styles.image}
            />
          ))}
        </View>
      ) : (
        <Text>{t("No Images Selected")}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  previewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 6,
  },
});

export default ImagePreviewList;
