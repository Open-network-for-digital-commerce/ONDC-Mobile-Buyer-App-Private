import React from 'react';
import {StyleSheet, View} from 'react-native';
import Header from '../header/Header';
import Categories from '../home/Categories';
import {useAppTheme} from '../../../../../utils/theme';
import StoresNearMe from '../../../category/components/StoresNearMe';

const Home = () => {
  const theme = useAppTheme();
  const styles = makeStyles(theme.colors);

  return (
    <View style={styles.container}>
      <Header />
      <Categories />
      <StoresNearMe />
    </View>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.white,
    },
  });

export default Home;
