import React, { ReactNode, useCallback, useMemo } from 'react';
import { View, FlatList, FlatListProps, ScrollView, ScrollViewProps } from 'react-native';

/**
 * FlatList otimizada com memoization
 */
export function OptimizedFlatList<T>({
  data,
  renderItem,
  keyExtractor,
  ...props
}: FlatListProps<T>) {
  // Memoize callbacks para evitar re-renders
  const memoizedRenderItem = useCallback(renderItem, []);
  const memoizedKeyExtractor = useCallback(
    keyExtractor || ((item: any, index: number) => `item-${index}`),
    []
  );

  return (
    <FlatList
      {...props}
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={memoizedKeyExtractor}
      // Otimizações de performance
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
      // Melhorias visuais
      showsVerticalScrollIndicator={false}
    />
  );
}

/**
 * ScrollView otimizado
 */
export const OptimizedScrollView = React.memo(
  ({ children, ...props }: ScrollViewProps) => {
    return (
      <ScrollView
        {...props}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        {children}
      </ScrollView>
    );
  }
);

OptimizedScrollView.displayName = 'OptimizedScrollView';

/**
 * Container otimizado para componentes pesados
 */
interface OptimizedContainerProps {
  children: ReactNode;
  shouldUpdate?: boolean;
}

export const OptimizedContainer = React.memo(
  ({ children, shouldUpdate }: OptimizedContainerProps) => {
    return <View style={{ flex: 1 }}>{children}</View>;
  },
  (prevProps, nextProps) => {
    // Só re-renderiza se shouldUpdate mudar
    if (prevProps.shouldUpdate !== nextProps.shouldUpdate) {
      return false;
    }
    return true;
  }
);

OptimizedContainer.displayName = 'OptimizedContainer';

/**
 * Hook para memoização de valores computados
 */
export function useComputedValue<T>(
  computeFn: () => T,
  dependencies: React.DependencyList
): T {
  return useMemo(computeFn, dependencies);
}

/**
 * Hook para memoização de objetos
 */
export function useMemoizedObject<T extends object>(
  obj: T,
  dependencies: React.DependencyList = []
): T {
  return useMemo(() => obj, dependencies);
}

/**
 * Componente genérico otimizado
 */
interface OptimizedComponentProps<T> {
  data: T;
  render: (data: T) => ReactNode;
  compareData?: (prev: T, next: T) => boolean;
}

export function OptimizedComponent<T>({
  data,
  render,
  compareData
}: OptimizedComponentProps<T>) {
  const MemoizedComponent = React.memo(
    () => <>{render(data)}</>,
    compareData
      ? (prev, next) => compareData(prev.data as T, next.data as T)
      : undefined
  );

  return <MemoizedComponent data={data} />;
}
