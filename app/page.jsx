"use client"
import Image from 'next/image'
import { useEffect, useState } from 'react';
import { Web3Storage, getFilesFromPath } from 'web3.storage';
import Path from 'path'
import { v4 as uuidv4 } from 'uuid';
import { ChakraProvider, Button } from '@chakra-ui/react'
import { collection, addDoc, doc, setDoc, getDocs } from "firebase/firestore";
import { db } from './firebase';
import { Skeleton, SkeletonCircle, SkeletonText, Box, Stack } from '@chakra-ui/react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { set } from 'firebase/database';
import CryptoJS from 'crypto-js';
import axios from 'axios';



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

  function AESEncryption(s) {
    const secretKey = 'testsecret'; // 16, 24, or 32 bytes
    const iv = 'testiv'; // 16 bytes

    const textToEncrypt = CryptoJS.enc.Utf8.parse(s.name);

    const encrypted = CryptoJS.AES.encrypt(textToEncrypt, CryptoJS.enc.Utf8.parse(secretKey), {
      iv: CryptoJS.enc.Utf8.parse(iv),
      mode: CryptoJS.mode.CFB, // You can choose the mode you prefer
      padding: CryptoJS.pad.Pkcs7, // You can choose the padding you prefer
    });

    const ciphertext = encrypted.toString();

    console.log('Ciphertext:', ciphertext);

    return ciphertext;

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
    if (!image) {
      toast("Kindly Select File to Upload!");
      return;
    }
    setFetched(false);

    const formData = new FormData();
    const JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzNGIxNzc2OC03MzY5LTQzN2ItOGEzNS02YTk3MmJjZWU2NDMiLCJlbWFpbCI6ImdlcGVsaTcyODBAZHhpY2UuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImNhM2RmZjFhNzI1Yzc3NWYyYTA4Iiwic2NvcGVkS2V5U2VjcmV0IjoiM2UxMGM5YTkyM2YyMGExYjdmMmFhZjhiZmNhMjQ2NWZlZmE0ZDQ0NGNiNzNkMDM2NzcxNmIxZmQzMzI2MGE1NyIsImlhdCI6MTcxMzg2MTk3OH0.0j80IgEBwarUc7yxJWJK62u_CU239BuQ6kD1UmwN1Lc"

    // const file = fs.createReadStream(image);
    const aesen = AESEncryption(image);
    const ext = image.name.split('.').pop();
    const fileName = `${uuidv4()}.${ext}`;
    // const newFile = new File([image], fileName + aesen, { type: image.type });
    formData.append('file', image)

    const pinataMetadata = JSON.stringify({
      name: 'File name',
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    })
    formData.append('pinataOptions', pinataOptions);

    try {
      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: "Infinity",
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'Authorization': `Bearer ${JWT}`
        }
      });
      console.log(res.data);
      const data = res.data;
      const hash = data.IpfsHash;
      console.log(hash);
      console.log(`https://amethyst-decisive-coral-643.mypinata.cloud/ipfs/${hash}`);
      try {
        await setDoc(doc(db, "images", fileName), {
          cid: hash,
          name: fileName,
          url: `https://amethyst-decisive-coral-643.mypinata.cloud/ipfs/${hash}`
        });
        setAlldocs([]);
        fetchImages();
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    } catch (error) {
      console.log(error);
    }
    if (false) {
      const storage = new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN });
      // const fileData = await getFilesFromPath(image);
      // const cid = await storage.put(formData);
      // console.log(cid);
      console.log(image);
      const aesen = AESEncryption(image);
      const ext = image.name.split('.').pop();
      const fileName = `${uuidv4()}.${ext}`;
      const newFile = new File([image], fileName + aesen, { type: image.type });
      try {
        const cid = await storage.put([newFile]);
        console.log(`IPFS CID: ${cid}`)
        console.log(`Gateway URL: https://dweb.link/ipfs/${cid}`)
        console.log(`https://${cid}.ipfs.w3s.link/${fileName + aesen}`)
        try {
          await setDoc(doc(db, "images", fileName), {
            cid: cid,
            name: fileName,
            url: `https://${cid}.ipfs.w3s.link/${fileName + aesen}`
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
                  <Image src={doc.url} alt={doc.name} width={500} height={500} onClick={() => {
                    window.open(doc.url, "_blank")
                  }} />
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
