type UniPromiseTuple<T = unknown> = [unknown, T]

const isPromiseLike = (value: unknown): value is PromiseLike<unknown> =>
  !!value &&
  (typeof value === 'object' || typeof value === 'function') &&
  typeof (value as PromiseLike<unknown>).then === 'function'

;(uni as any).addInterceptor({
  returnValue(res: unknown) {
    if (!isPromiseLike(res)) {
      return res
    }

    return new Promise((resolve, reject) => {
      res.then((result: unknown) => {
        if (!result) return resolve(result)
        const tuple = result as UniPromiseTuple
        return tuple[0] ? reject(tuple[0]) : resolve(tuple[1])
      })
    })
  },
})
