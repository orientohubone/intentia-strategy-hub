import { lazy, ComponentType, LazyExoticComponent } from 'react';

type PreloadableComponent<T extends ComponentType<any>> = LazyExoticComponent<T> & {
  preload: () => Promise<void>;
};

export function lazyWithPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): PreloadableComponent<T> {
  const Component = lazy(factory);

  (Component as any).preload = factory;

  return Component as PreloadableComponent<T>;
}
