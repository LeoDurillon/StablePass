type IfEquals<X, Y, A, B> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

type isFunction<T, P extends keyof T> = T[P] extends Function ? never : P;

type PropertyOf<T extends object> = Partial<{
  [P in keyof T as IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    P,
    never
  > extends never
    ? never
    : isFunction<T, P>]: T[P];
}>;

export default function createElement<T extends keyof HTMLElementTagNameMap>(
  element: T,
  data?: {
    id?: string;
    class?: string;
    style?: PropertyOf<HTMLElementTagNameMap[T]["style"]>;
    innerText?: string;
  },
  props?: Omit<PropertyOf<HTMLElementTagNameMap[T]>, "style" | "className" | "id" | "innerText">,
) {
  const res = document.createElement(element);
  if (data) {
    if (data.id) {
      res.id = data?.id ?? "";
    }
    if (data.class) {
      res.className = data?.class ?? "";
    }
    if (data.style) {
      Object.entries(data.style).forEach(([key, val]) => {
        if (!val || typeof val !== "string") return;
        res.style.setProperty(key.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase(), val);
      });
    }
    if (data.innerText) {
      res.innerText = data.innerText;
    }
  }

  if (props) {
    (Object.keys(props) as Array<keyof typeof props>).forEach((key) => {
      if (!(key in res)) return;
      if (!props[key]) return;
      res[key] = props[key];
    });
  }

  return res;
}
