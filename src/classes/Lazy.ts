type LazyValue<T> = { lazy: true; value: () => T } | { lazy: false; value: T }

/**
 * Wrapper for values that handles delaying evaluation and memoising results
 */
export class Lazy<T> {
    private _value: LazyValue<T>

    /**
     * Creates a lazy instance from either an evaluated or an unevaluated value and a boolean value
     *
     * @example
     * const lazyValue: Lazy<number> = new Lazy({ lazy: false, value: 3 })
     *
     * @param value A pre-instantiated lazy value along with the adequate flag for state of evaluation
     */
    constructor(value: LazyValue<T>) {
        this._value = value
    }

    /**
     * Creates a lazy instance from an unevaluated value
     *
     * @example
     * const lazyValue: Lazy<number> = Lazy.lazy(() => 3)
     *
     * @param value A function that returns a value
     * @returns A lazy instance of the to-be-evaluated value
     */
    static lazy<T>(value: () => T): Lazy<T> {
        return new this({ value, lazy: true })
    }

    /**
     * Creates a lazy instance from an evaluated value
     *
     * @example
     * const lazyValue: Lazy<number> = Lazy.pure(3)
     *
     * @param value An already evaluated value
     * @returns A lazy instance of the evaluated value
     */
    static pure<T>(value: T): Lazy<T> {
        return new this({ value, lazy: false })
    }

    /**
     * Returns the inner value of the lazy instance
     *
     * @example
     * const lazyValue: Lazy<number> = Lazy.lazy(() => 3)
     *
     * console.log(lazyValue.value) // 3
     */
    public get value(): T {
        const { _value } = this

        if (_value.lazy) {
            this._value = { lazy: false, value: _value.value() }

            return _value.value()
        }

        return _value.value
    }

    /**
     * Applies a transformation on the inner value then wraps everything in an unevaluated lazy instance
     *
     * @example
     * const lazyValue: Lazy<number> = Lazy.lazy(() => 3)
     * const mapper = (x: number): number => x * 2
     *
     * console.log(lazyValue.map(mapper).value) // 6
     *
     * @param mapper A mapping function to apply on the inner value
     * @returns A lazy instance of the unevaluated mapped value
     */
    public map<U>(mapper: (value: T) => U): Lazy<U> {
        return Lazy.lazy(() => mapper(this.value))
    }

    /**
     * Applies a transformation on the inner value then wraps the inner value of the result in an unevaluated lazy instance to ensure maximum delay in evaluation
     *
     * @example
     * const lazyValue: Lazy<number> = Lazy.lazy(() => 3)
     * const binder = (x: number): Lazy<number> => Lazy.lazy(() => x * 2)
     *
     * console.log(lazyValue.bind(binder).value) // 6
     *
     * @param binder A bind function to apply on the inner value
     * @returns A lazy instance of the unevaluated binded value
     */
    public bind<U>(binder: (value: T) => Lazy<U>): Lazy<U> {
        return Lazy.lazy(() => binder(this.value).value)
    }

    /**
     * Applies a transformation on the lazy value then wraps everything in an unevaluated lazy instance
     *
     * @example
     * const lazyValue: Lazy<number> = Lazy.lazy(() => 3)
     * const extender = (x: Lazy<number>): number => x.value * 2
     *
     * console.log(lazyValue.extend(extender)) // 6
     *
     * @param extender An extend function to apply on the lazy value
     * @returns A lazy instance of the unevaluated extended value
     */
    public extend<U>(extender: (value: Lazy<T>) => U): Lazy<U> {
        return Lazy.lazy(() => extender(this))
    }

    /**
     * Applies a transformation on the lazy value then wraps everything in an unevaluated lazy instance
     *
     * @example
     * const lazyValue: Lazy<number> = Lazy.lazy(() => 3)
     * const applier = Lazy.lazy(() => (x: number): number => x * 2)
     *
     * console.log(lazyValue.apply(applier)) // 6
     *
     * @param applier An apply function to apply on the value
     * @returns A lazy instance of the unevaluated applied value
     */
    public apply<U>(applier: Lazy<(value: T) => U>): Lazy<U> {
        return Lazy.lazy(() => applier.value(this.value))
    }

    /**
     * Returns the inner lazy value of a nested lazy value
     *
     * @example
     * const lazyValue: Lazy<Lazy<number>> = Lazy.lazy(() => Lazy.pure(3))
     * const flattenedLazyValue: Lazy<number> = lazyValue.flat()
     *
     * console.log(flattenedLazyValue.value) // 3
     *
     * @returns the inner lazy instance
     */
    public flat(): T extends Lazy<infer _> ? T : never {
        return this.value as T extends Lazy<infer _> ? T : never
    }

    /**
     * Returns the inner lazy value of a double-nested lazy instance
     *
     * @example
     * const lazyValue: Lazy<Lazy<number>> = Lazy.lazy(() => Lazy.pure(3))
     *
     * console.log(Lazy.join(lazyValue)) // Lazy { _value: { lazy: false, value: 3 } }
     * console.log(Lazy.join(lazyValue).value) // 3
     *
     * @param value A double nested lazy instance
     * @returns The inner lazy instance
     */
    static join<T>(value: Lazy<Lazy<T>>): Lazy<T> {
        return value.value
    }

    public toString(): string {
        return `${this.value}`
    }

    public toJSON(): LazyValue<T> {
        return { lazy: false, value: this.value }
    }
}
