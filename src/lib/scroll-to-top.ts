import { useEffect, type DependencyList, type RefObject } from "react"

export const APP_MAIN_SCROLL_ID = "app-main-scroll"

export function scrollToTop(element?: HTMLElement | null) {
  element?.scrollTo({ top: 0, left: 0 })
}

export function scrollAppMainToTop() {
  scrollToTop(document.getElementById(APP_MAIN_SCROLL_ID))
}

export function useScrollToTopOnChange(
  ref: RefObject<HTMLElement | null>,
  deps: DependencyList
) {
  useEffect(() => {
    scrollToTop(ref.current)
  }, deps)
}
