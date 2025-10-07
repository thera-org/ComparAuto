// src/lib/storage.ts
import { supabase } from './supabase'

export const uploadImage = async (
  file: File,
  folder: string = 'oficinas'
): Promise<string | null> => {
  try {
    const fileName = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`

    // Tentar primeiro com o bucket 'imagens' que existe
    let bucketName = 'imagens'
    let { error: uploadError } = await supabase.storage.from(bucketName).upload(fileName, file)

    if (uploadError && uploadError.message.includes('Bucket not found')) {
      // Se não existir, tentar com 'oficinas-imagens'
      bucketName = 'oficinas-imagens'
      const result = await supabase.storage.from(bucketName).upload(fileName, file)
      uploadError = result.error

      if (uploadError && uploadError.message.includes('Bucket not found')) {
        // Se ainda não existir, criar o bucket 'images'
        console.log('Criando bucket images...')
        const { error: createBucketError } = await supabase.storage.createBucket('images', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'],
          fileSizeLimit: 5242880, // 5MB
        })

        if (createBucketError) {
          console.error('Erro ao criar bucket:', createBucketError)
          return null
        }

        // Tentar fazer upload novamente
        const { error: retryUploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file)

        if (retryUploadError) {
          console.error('Erro no segundo upload:', retryUploadError)
          return null
        }
      } else if (uploadError) {
        console.error('Erro ao fazer upload:', uploadError)
        return null
      }
    } else if (uploadError) {
      console.error('Erro ao fazer upload:', uploadError)
      return null
    }

    // Obter URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(fileName)

    return publicUrl
  } catch (error) {
    console.error('Erro geral no upload:', error)
    return null
  }
}

export const uploadMultipleImages = async (
  files: File[],
  folder: string = 'oficinas'
): Promise<string[]> => {
  const urls: string[] = []

  for (const file of files) {
    const url = await uploadImage(file, folder)
    if (url) {
      urls.push(url)
    }
  }

  return urls
}
