import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {getStoredData, saveMultipleData} from '../utils/storage';

export default () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const storeDetails = async (idTokenResult: any, user: any) => {
    try {
      const name = user?.displayName ? user?.displayName : 'Unknown';
      const photoURL = user?.photoURL ? user?.photoURL : '';

      await saveMultipleData([
        ['token', idTokenResult?.token],
        ['emailId', user?.email],
        ['uid', user?.uid],
        ['name', name],
        ['photoURL', photoURL],
      ]);
      const payload = {
        token: idTokenResult?.token,
        emailId: user?.email,
        uid: user?.uid,
        name: name,
        photoURL: photoURL,
      };
      dispatch({type: 'set_login_details', payload});

      const address = await getStoredData('address');
      if (address) {
        navigation.reset({
          index: 0,
          routes: [{name: 'Dashboard'}],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{name: 'AddressList', params: {navigateToDashboard: true}}],
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return {storeDetails};
};
