import { useLayoutEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import NotificationIcon from './NotificationIcon';

const SetHeaderRight = ({ title }: { title?: string }) => {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title,
      headerRight: () => <NotificationIcon />,
      headerRightContainerStyle: { paddingRight: 16 },
    });
  }, [navigation, title]);

  return null; 
};

export default SetHeaderRight;
