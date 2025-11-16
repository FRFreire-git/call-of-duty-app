import React from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * Componente Principal da Aplicação
 * Configura a navegação e serviços principais
 */
const App: React.FC = () => {
  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#007AFF"
        translucent={false}
      />
      <AppNavigator />
    </>
  );
};

export default App;
