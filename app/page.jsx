"use client"
import Image from 'next/image'
import { useEffect, useState } from 'react';
import { Web3Storage, getFilesFromPath } from 'web3.storage';
import Path from 'path'
import { v4 as uuidv4 } from 'uuid';
import { ChakraProvider, Button } from '@chakra-ui/react'
import { collection, addDoc, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from './firebase';
import { Skeleton, SkeletonCircle, SkeletonText, Box ,Stack} from '@chakra-ui/react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { set } from 'firebase/database';


export default function Home() {
  const [image, setImage] = useState('');
  const [alldocs, setAlldocs] = useState([]);
  const [fetched, setFetched] = useState(false);
  useEffect(() => {
    fetchImages();
  }, [])


  function handleImage(e) {
    console.log(e.target.files);
    setImage(e.target.files[0]);
  }

  async function fetchImages() {
    //fetch all documents from images collection
    const imagesRef = collection(db, "images");
    const querySnapshot = await getDocs(imagesRef);
    const newAlldocs = [];
    querySnapshot.forEach((doc) => {
      newAlldocs.push(doc.data());
      // doc.data() is never undefined for query doc snapshots
      // setAlldocs([...alldocs, doc.data()])
      // setAlldocs([doc.data()])
    });
    setAlldocs(newAlldocs);
    console.log("alldocs");
    console.log(alldocs);
    setFetched(true);
  }

  async function handleUpload() {
    if(!image){
      toast("Kindly Select File to Upload!");
      return;
    }
    setFetched(false);
    const storage = new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN });
    // const fileData = await getFilesFromPath(image);
    // const cid = await storage.put(formData);
    // console.log(cid);
    console.log(image);
    const ext = image.name.split('.').pop();
    const fileName = `${uuidv4()}.${ext}`;
    const newFile = new File([image], fileName, { type: image.type });
    try {
      const cid = await storage.put([newFile]);
      console.log(`IPFS CID: ${cid}`)
      console.log(`Gateway URL: https://dweb.link/ipfs/${cid}`)
      console.log(`https://${cid}.ipfs.w3s.link/${fileName}`)
      try {
        await setDoc(doc(db, "images", fileName), {
          cid: cid,
          name: fileName,
          url: `https://${cid}.ipfs.w3s.link/${fileName}`
        });
        setAlldocs([]);
        fetchImages();
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }
    catch (e) {
      console.log(e);
    }
  }
  return (
    <ChakraProvider>
      <div className='text-center mt-10'>
        <h1 className='font-bold text-3xl'>Decentralized Multifile IPFS Based Storage System</h1>
        <div className='m-5 items-center' >
          <input type="file" name='file' onChange={handleImage} />
          <br />
          <Button colorScheme='blue' className='m-5' onClick={handleUpload}>Upload Image</Button>
          <br />
          {/* <Button colorScheme='blue' className='m-5' onClick={fetchImages}>Fetch Images</Button> */}
          {fetched ? <div className='flex flex-wrap'>
            {alldocs.map((doc) => {
              return (
                <div className='m-5'>
                  <Image src={doc.url} alt={doc.name} width={500} height={500} onClick={()=>{
                    window.open(doc.url)
                  }}/>
                  {/* <p className='text-xs'>CID: {doc.cid}</p> */}
                  <p className='text-xs'>{doc.name}</p>
                </div>
              )
            })}
          </div> :
            <div className='ml-36 mr-36'>
              <Stack>
              <SkeletonCircle size='10' />
                <Skeleton height='20px' />
                <Skeleton height='20px' />
                <Skeleton height='20px' />
                <Skeleton height='20px' />
                <Skeleton height='20px' />
                <Skeleton height='20px' />
              </Stack>
            </div>
          }
        </div>

      </div>
      <ToastContainer />
    </ChakraProvider>
    
  )
}
