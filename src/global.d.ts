import { FC, SVGProps } from 'react'

declare module '*.svg' {
  const content: FC<SVGProps<SVGElement>>
  export default content
}
