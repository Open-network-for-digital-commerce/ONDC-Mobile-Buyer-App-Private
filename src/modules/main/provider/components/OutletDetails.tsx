import React, {useMemo, useState} from 'react';
import {
  Linking,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {Text} from 'react-native-paper';
import FastImage from 'react-native-fast-image';
import {useTranslation} from 'react-i18next';
import {Grayscale} from 'react-native-color-matrix-image-filters';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import BrandSkeleton from '../../../../components/skeleton/BrandSkeleton';
import {useAppTheme} from '../../../../utils/theme';
import useMinutesToString from '../../../../hooks/useMinutesToString';
import StoreIcon from '../../../../assets/no_store_icon.svg';

interface OutletDetails {
  provider: any;
  outlet: any;
  apiRequested: boolean;
}

const Closed = require('../../../../assets/closed.png');
const NoImageAvailable = require('../../../../assets/no_store.png');

const OutletImage = ({source, isOpen}: {source: any; isOpen: boolean}) => {
  const theme = useAppTheme();
  const styles = makeStyles(theme.colors);
  const [imageSource, setImageSource] = useState(source);
  const [imageLoadFailed, setImageLoadFailed] = useState<boolean>(false);

  const onError = () => {
    setImageLoadFailed(true);
    setImageSource(NoImageAvailable);
  };

  if (source) {
    if (isOpen) {
      return (
        <FastImage
          style={styles.headerImage}
          source={imageSource}
          resizeMode={
            imageLoadFailed
              ? FastImage.resizeMode.cover
              : FastImage.resizeMode.contain
          }
          onError={onError}
        />
      );
    } else {
      return (
        <Grayscale>
          <FastImage
            style={styles.headerImage}
            source={imageSource}
            resizeMode={
              imageLoadFailed
                ? FastImage.resizeMode.cover
                : FastImage.resizeMode.contain
            }
            onError={onError}
          />
        </Grayscale>
      );
    }
  } else {
    return (
      <View style={[styles.headerImage, styles.brandImageEmpty]}>
        <StoreIcon width={48} height={48} />
      </View>
    );
  }
};

const OutletDetails: React.FC<OutletDetails> = ({
  provider,
  outlet,
  apiRequested,
}) => {
  const {t} = useTranslation();
  const {convertMinutesToHumanReadable, translateMinutesToHumanReadable} =
    useMinutesToString();
  const theme = useAppTheme();
  const styles = makeStyles(theme.colors);

  const getDirection = async () => {
    const {address} = outlet;
    const addressString = [
      address.name,
      address.street,
      address.locality,
      address.city,
      address.state && `${address.state} - ${address.area_code}`,
      address.country,
    ]
      .filter(value => value) // Filters out null, undefined, or empty string values
      .join(', ');
    const url =
      Platform.OS === 'android'
        ? `geo:0,0?q=${addressString}`
        : `maps:0,0?q=${addressString}`;
    await Linking.openURL(url);
  };

  const callProvider = () => Linking.openURL('tel:+91 92729282982');

  const {timeToShip, imageSource} = useMemo(() => {
    let source = null;
    let time = {type: 'minutes', time: 0};

    if (outlet) {
      if (outlet?.provider_descriptor?.symbol) {
        source = {uri: outlet?.provider_descriptor?.symbol};
      } else if (outlet?.provider_descriptor?.images?.length > 0) {
        source = {uri: outlet?.provider_descriptor?.images[0]};
      }
      if (outlet?.minDaysWithTTS) {
        time = convertMinutesToHumanReadable(
          Number(outlet?.minDaysWithTTS / 60),
        );
      }
    }
    return {timeToShip: time, imageSource: source};
  }, [outlet]);

  if (apiRequested) {
    return <BrandSkeleton />;
  }

  return (
    <View>
      {!outlet?.isOpen && (
        <FastImage
          style={styles.brandImage}
          source={Closed}
          resizeMode={FastImage.resizeMode.cover}
        />
      )}
      <View style={styles.brandDetails}>
        <View style={styles.providerDetails}>
          <View style={styles.providerLocalityView}>
            <Text
              variant={'headlineSmall'}
              style={styles.title}
              ellipsizeMode={'tail'}
              numberOfLines={1}>
              {provider?.descriptor?.name}
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={callProvider}
                style={styles.actionButton}>
                <Icon name={'phone'} color={theme.colors.primary} size={18} />
              </TouchableOpacity>
              <View style={styles.separator} />
              <TouchableOpacity
                style={styles.actionButton}
                onPress={getDirection}>
                <Icon
                  name={'directions'}
                  color={theme.colors.primary}
                  size={18}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.providerLocalityView}>
            {!!outlet?.address && (
              <Text
                variant={'labelLarge'}
                style={styles.address}
                ellipsizeMode={'tail'}
                numberOfLines={1}>
                {outlet?.address?.locality || 'NA'}
              </Text>
            )}
          </View>
          <View style={styles.providerLocalityView}>
            <MaterialCommunityIcon
              name={'clock'}
              size={16}
              color={theme.colors.neutral200}
            />
            <Text variant={'labelLarge'} style={styles.address}>
              {translateMinutesToHumanReadable(
                timeToShip.type,
                timeToShip.time,
              )}
            </Text>
            {!outlet?.isOpen && (
              <>
                <View style={styles.dotView} />
                <Text variant={'labelLarge'} style={styles.address}>
                  {t('Store.Opens at', {time: outlet?.time_from})}
                </Text>
              </>
            )}
          </View>
        </View>
        <OutletImage source={imageSource} isOpen={outlet?.isOpen} />
      </View>
      <View style={styles.borderBottom} />
    </View>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    brandImage: {
      height: 220,
      backgroundColor: colors.black,
    },
    brandDetails: {
      paddingHorizontal: 16,
      paddingTop: 20,
      flexDirection: 'row',
    },
    borderBottom: {
      backgroundColor: colors.neutral100,
      height: 1,
      marginTop: 24,
    },
    title: {
      flex: 1,
      color: colors.neutral400,
      paddingRight: 12,
    },
    address: {
      color: colors.neutral300,
      flex: 1,
      marginLeft: 3,
    },
    open: {
      color: colors.success600,
    },
    timing: {
      color: colors.neutral300,
    },
    providerLocalityView: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    dotView: {
      height: 4,
      width: 4,
      borderRadius: 4,
      backgroundColor: colors.neutral300,
      marginHorizontal: 5,
    },
    headerImage: {height: 80, width: 80, borderRadius: 15},
    buttonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    separator: {
      width: 8,
    },
    actionButton: {
      height: 28,
      width: 28,
      borderRadius: 28,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: colors.primary,
      backgroundColor: 'rgba(236, 243, 248, 1)',
    },
    getDirection: {
      borderColor: colors.error400,
    },
    providerDetails: {flex: 1, paddingRight: 24},
    brandImageEmpty: {
      backgroundColor: colors.neutral200,
    },
  });

export default OutletDetails;
