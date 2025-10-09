'use client'

import React, {useEffect, useState} from 'react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {subjects} from "@/constants";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {formUrlQuery, removeKeysFromUrlQuery} from "@jsmastery/utils";

const SubjectFilter = () => {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams()

    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const delayDebounceFn = setTimeout(()=>{

            if(searchQuery){
                const newUrl = formUrlQuery({
                    params: searchParams.toString(),
                    key: 'subject',
                    value: searchQuery
                })
                router.push(newUrl, {scroll: false})
            }else{
                if(pathname === '/companions'){
                    const newUrl = removeKeysFromUrlQuery({
                        params: searchParams.toString(),
                        keysToRemove:['subject']
                    })
                    router.push(newUrl, {scroll: false})
                }
            }
        },500)


    },[searchQuery, router, pathname, searchParams])

    return (
        <div className={'relative border border-black rounded-lg items-center flex gap-2 px-2 py-1 h-fit'}>
            <Select onValueChange={(value) => setSearchQuery(value)}>
                <SelectTrigger className=" capitalize">
                    <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value={'all'}>All subjects</SelectItem>
                        {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject} className={'capitalize'}>{subject}</SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>

        </div>
    );
};

export default SubjectFilter;