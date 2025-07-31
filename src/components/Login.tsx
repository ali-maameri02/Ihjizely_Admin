import logo from '../assets/ihjzlyapplogo.png'
import { LoginForm } from "@/components/login-form"
import SvgImg from "@/assets/web-development-programmer-engineering-coding-website-augmented-reality-interface-screens_641890-20-removebg-preview.png"
export default function LoginPage() {
  return (
    <div className="bg- flex min-h-svh flex-row items-center justify-center gap-6 p-6 md:p-10">
           <img width={300} src={SvgImg} className='bg-white' alt="" />
      
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className=" text-primary-foreground flex size- items-center justify-center rounded-md">
           <img src={logo} alt="" />
          </div>
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
