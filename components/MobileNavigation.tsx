'use client';

import React, { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import Image from 'next/image'
import { usePathname } from 'next/navigation';
import { Separator } from './ui/separator';
import Link from 'next/link';
import { navItems } from '@/constants';
import { cn } from '@/lib/utils';
import FileUploader from './FileUploader';
import { Button } from './ui/button';
import { signOutUser } from '@/lib/actions/user.actions';
import Search from './Search';
 
interface props{
    $id:string
    accountId:string
    fullName:string
    email:string
    avatar:string
}

const MobileNavigation = ({$id:ownerId,accountId,fullName,email,avatar}:props) => {
    const [open, setOpen] = useState(false);
    const pathname = usePathname()

  return (
    <header className='mobile-header'>
        <Image src="/assets/icons/logo-full-brand.svg"alt='log' width={120} height={52} className='h-auto'/>
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger><Image src="/assets/icons/menu.svg" alt='menu' width={30} height={30}/></SheetTrigger>
            <SheetContent className='shad-sheet h-screen px-3'>
                <SheetTitle>
                    <div className='header-user'>
                        <Image src={avatar} alt='avatar' width={44} height={44} className='header-user-avatar'/>
                        <div className='sm:hidden lg:block'>
                            <p className='subtitle-2 capitalize'>
                                {fullName}
                            </p>
                            <p className='caption'>
                                {email}
                            </p>
                        </div>
                    </div>
                    <Separator  className='mb-4 bg-light-200/20'/>
                    <Search onResultClick={() => setOpen(false)} />
                    <Separator className='my-4 bg-light-200/20'/>
                </SheetTitle>
                <nav className='mobile-nav'>
                <ul className='mobole-nav-list'>
                    {navItems.map(({url,name,icon}) => (
                <Link key={name} href={url} className='lg:w-full'>
                    <li className={cn("mobile-nav-item",pathname===url && "shad-active")}>
                        <Image src={icon} alt={name} width={24} height={24} className={cn('nav-icon',pathname===url && 'nav-icon-active')}/>
                        <p > {name}</p>
                    </li>
                </Link>
         ))}

                </ul>
                </nav>
                <Separator className='my-4 bg-light-200/20'/>
                <div className='flex flex-col gap-4 justify-between'>
                    <FileUploader ownerId={ownerId} accountId={accountId} className='w-full'/>

                    <Button  type='submit' className='mobile-sign-out-button' onClick={async()=>await signOutUser()}>
                <Image src="/assets/icons/logout.svg" alt="sign out" width={24} height={24} />
                <p>Logout</p>
            </Button>
                </div>
            </SheetContent>
        </Sheet>
    </header>
  )
}

export default MobileNavigation
