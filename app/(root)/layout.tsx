import Header from '@/components/Header'
import MobileNavigation from '@/components/MobileNavigation'
import SideBar from '@/components/SideBar'
import { Toaster } from '@/components/ui/toaster'
import { getCurrentUser } from '@/lib/actions/user.actions'
import { redirect } from 'next/navigation'
import React from 'react'

export const dynamic = 'force-dynamic'; // This will ensure the layout is always dynamic and not cached

const layout =  async ({children}:{children:React.ReactNode}) => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return redirect('/sign-in');
    }
  return <main className='flex h-screen'>
    <SideBar{...currentUser}/>
    <section className='flex h-full flex-1 flex-col'>
        <MobileNavigation {...currentUser}/>
         <Header userId={currentUser.$id} accountId={currentUser.accountId} />
        <div className='main-content'>
            {children}
        </div>
    </section>
    <Toaster/>
  </main>
}

export default layout
