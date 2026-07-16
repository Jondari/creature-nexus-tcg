jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    LinearGradient: ({ children, ...props }: { children?: React.ReactNode }) =>
      React.createElement(View, props, children),
  };
});

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');

  return new Proxy(
    { __esModule: true },
    {
      get: (target, property) => {
        if (property in target) {
          return target[property as keyof typeof target];
        }

        return (props: Record<string, unknown>) =>
          React.createElement(View, {
            ...props,
            testID: `icon-${String(property)}`,
          });
      },
    }
  );
});
