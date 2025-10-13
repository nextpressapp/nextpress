import { ComponentType } from "react"
import { render } from "@react-email/render"

export async function renderEmail<T>(EmailComponent: ComponentType<T>, props: T) {
  // @ts-expect-error TS2769
  return render(<EmailComponent {...props} />, { pretty: true })
}
