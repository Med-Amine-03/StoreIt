import Card from '@/components/Card';
import Sort from '@/components/Sort';
import { getFiles, getTotalSpaceUsed } from '@/lib/actions/file.actions';
import { getFileTypesParams } from '@/lib/utils';
import { FileType, SearchParamProps } from '@/types'
import { Models } from 'node-appwrite';
import React from 'react'

const page = async({searchParams,params}:SearchParamProps) => {
    const type =((await params)?.type as string)|| '';
    const searchText=((await searchParams)?.query as string) || '';
    const sort=((await searchParams)?.sort as string) || '';
    const types =getFileTypesParams(type) as FileType[];
    const files = await getFiles({ types ,searchText,sort}); 
    const totalSpace = await getTotalSpaceUsed();
    const totalUsed = typeof totalSpace === 'string' ? JSON.parse(totalSpace).used : totalSpace.used;
    const totalUsedMB = (totalUsed / (1024 * 1024)).toFixed(2);


  return (
    <div className='page-container'>
        <section className='w-full'>
            <h1 className='h1 capitalize'>
                {type}
            </h1>
            <div className='total-size-section flex justify-between items-center'>
                <div className='sort-container ml-auto flex items-center gap-2'>
                    <p className='body-1 hidden sm:block text-light-200'>
                        Sort by: 
                    </p>
                    <Sort/>
                </div>  
            </div>
        </section>
        {files.total >0?(
          <section className='file-list'>
              {files.documents.map((file:Models.Document)=>(
                <Card key={file.$id} file={file}/>
              ))}
          </section>
        ):<p className='empty-list'>No files found</p>}
    </div>
  )
}

export default page