'use client'

import { useState, useId } from 'react'

import { FileTextIcon, AlertCircleIcon, XIcon, CloudUploadIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Rating } from '@/components/ui/rating'

import { formatBytes, useFileUpload, type FileWithPreview } from '@/hooks/use-file-upload'

type UploadProgress = {
  fileId: string
  progress: number
  completed: boolean
}

// Simulates file upload with realistic progress reporting and variable timing
const simulateUpload = (totalBytes: number, onProgress: (progress: number) => void, onComplete: () => void) => {
  let timeoutId: NodeJS.Timeout
  let uploadedBytes = 0
  let lastProgressReport = 0

  const simulateChunk = () => {
    const chunkSize = Math.floor(Math.random() * 300000) + 2000

    uploadedBytes = Math.min(totalBytes, uploadedBytes + chunkSize)

    const progressPercent = Math.floor((uploadedBytes / totalBytes) * 100)

    if (progressPercent > lastProgressReport) {
      lastProgressReport = progressPercent
      onProgress(progressPercent)
    }

    if (uploadedBytes < totalBytes) {
      const delay = Math.floor(Math.random() * 450) + 50

      const extraDelay = Math.random() < 0.05 ? 500 : 0

      timeoutId = setTimeout(simulateChunk, delay + extraDelay)
    } else {
      onComplete()
    }
  }

  timeoutId = setTimeout(simulateChunk, 100)

  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}

// Returns a file icon component for non-image files, or false for image files
const getFileIcon = (file: { file: File | { type: string; name: string } }) => {
  const fileName = file.file instanceof File ? file.file.name : file.file.name
  const fileType = file.file instanceof File ? file.file.type : file.file.type
  const extension = fileName.split('.').pop()?.toLowerCase()

  const isImage = fileType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'svg'].includes(extension || '')

  return isImage ? false : <FileTextIcon className='size-5' />
}

const ProductReviewForm = () => {
  const reviewTitle = useId()
  const reviewDescription = useId()
  const reviewTerms = useId()

  const [starCount, setStarCount] = useState(0)

  // FileUpload
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([])

  const handleFilesAdded = (addedFiles: FileWithPreview[]) => {
    const newProgressItems = addedFiles.map(file => ({
      fileId: file.id,
      progress: 0,
      completed: false
    }))

    setUploadProgress(prev => [...prev, ...newProgressItems])

    const cleanupFunctions: Array<() => void> = []

    addedFiles.forEach(file => {
      const fileSize = file.file instanceof File ? file.file.size : file.file.size

      const cleanup = simulateUpload(
        fileSize,

        progress => {
          setUploadProgress(prev => prev.map(item => (item.fileId === file.id ? { ...item, progress } : item)))
        },

        () => {
          setUploadProgress(prev => prev.map(item => (item.fileId === file.id ? { ...item, completed: true } : item)))
        }
      )

      cleanupFunctions.push(cleanup)
    })

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup())
    }
  }

  const handleFileRemoved = (fileId: string) => {
    setUploadProgress(prev => prev.filter(item => item.fileId !== fileId))
  }

  const maxSizeMB = 5
  const maxSize = maxSizeMB * 1024 * 1024
  const maxFiles = 10

  const [
    { files, isDragging, errors },
    { handleDragEnter, handleDragLeave, handleDragOver, handleDrop, openFileDialog, removeFile, getInputProps }
  ] = useFileUpload({
    maxSize,
    multiple: true,
    maxFiles,
    onFilesAdded: handleFilesAdded
  })

  return (
    <form className='space-y-6' onSubmit={e => e.preventDefault()}>
      <div className='space-y-3.5'>
        <h2 className='text-xl font-semibold'>Add Review</h2>
        <div className='flex items-center gap-3'>
          <Rating variant='yellow' size={16} value={starCount} precision={0.5} onValueChange={setStarCount} />
          <p className='font-medium'>{starCount} out of 5</p>
        </div>
      </div>
      <div className='w-full space-y-3.5'>
        <Label htmlFor={reviewTitle}>Review title</Label>
        <Input className='bg-background' id={reviewTitle} type='text' placeholder='Type here' />
      </div>
      <div className='w-full'>
        <Label className='mb-3.5' htmlFor={reviewDescription}>
          Review description
        </Label>
        <Textarea className='bg-background mb-1.5' placeholder='Type here' id={reviewDescription} />
        <p className='text-muted-foreground text-xs'>
          Problems with the product or delivery?
          <a href='#' className='text-primary underline'>
            Send a report.
          </a>
        </p>
      </div>
      <div className='w-full space-y-3.5'>
        <p className='text-sm font-medium'>
          Add real photos of the product to help other customers{' '}
          <span className='text-muted-foreground'>(Optional)</span>
        </p>
        <div className='border-input bg-background flex flex-col rounded-sm border border-dashed'>
          <div
            role='button'
            onClick={openFileDialog}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            data-dragging={isDragging || undefined}
            data-files={files.length > 0 || undefined}
            className='data-[dragging=true]:bg-accent/50 has-[input:focus]:border-ring has-[input:focus]:ring-ring/50 flex min-h-50 flex-col items-center justify-center gap-3 overflow-hidden p-6 text-center has-[input:focus]:ring-[3px]'
          >
            <input {...getInputProps()} className='sr-only' aria-label='Upload image file' />
            <CloudUploadIcon className='size-6' />
            <div className='space-y-1.5'>
              <p className='text-sm font-medium'>
                Click to upload <span className='text-muted-foreground font-normal'>or drag and drop</span>
              </p>
              <p className='text-muted-foreground text-sm'>SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
            </div>
          </div>
          {files.length > 0 && (
            <div className='flex w-full flex-col gap-3 pb-6'>
              <div className='mx-12 grid grid-cols-4 gap-4 max-sm:grid-cols-1'>
                {files.map(file => {
                  const fileProgress = uploadProgress.find(p => p.fileId === file.id)
                  const isUploading = fileProgress && !fileProgress.completed

                  return (
                    <div
                      key={file.id}
                      data-uploading={isUploading || undefined}
                      className='bg-background rounded-lg p-2 shadow-lg transition-opacity duration-300'
                    >
                      <div className='flex flex-col justify-between gap-2'>
                        <div className='flex items-center justify-center overflow-hidden in-data-[uploading=true]:opacity-50'>
                          <div className='bg-accent aspect-square shrink-0 rounded'>
                            {getFileIcon(file) || (
                              <img
                                src={file.preview}
                                alt={file.file.name}
                                className='size-40 rounded-[inherit] object-cover'
                              />
                            )}
                          </div>
                        </div>
                        <div className='flex justify-between'>
                          <div className='flex min-w-0 flex-col gap-0.5 max-sm:max-w-50'>
                            <p className='truncate font-medium'>
                              {file.file instanceof File ? file.file.name : file.file.name}
                            </p>
                            <p className='text-muted-foreground text-sm'>
                              {formatBytes(file.file instanceof File ? file.file.size : file.file.size)}
                            </p>
                          </div>
                          <Button
                            variant='ghost'
                            className='size-6 hover:bg-transparent'
                            onClick={() => {
                              handleFileRemoved(file.id)
                              removeFile(file.id)
                            }}
                            aria-label='Remove file'
                          >
                            <XIcon aria-hidden='true' />
                          </Button>
                        </div>
                      </div>

                      {fileProgress &&
                        (() => {
                          const progress = fileProgress.progress || 0
                          const completed = fileProgress.completed || false

                          if (completed) return null

                          return (
                            <div className='mt-1 flex flex-col gap-2'>
                              <span className='text-muted-foreground self-end text-sm'>{progress}%</span>
                              <div className='bg-primary/10 h-2 w-full overflow-hidden rounded-full'>
                                <div
                                  className='bg-primary h-full transition-all duration-300 ease-out'
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          )
                        })()}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className='text-destructive flex items-center justify-center gap-1 p-2 text-xs' role='alert'>
              <AlertCircleIcon className='size-3 shrink-0' />
              <span>{errors[0]}</span>
            </div>
          )}
        </div>
        <div className='flex items-center gap-7'>
          <span className='text-sm font-medium'> Do you recommend this product?</span>
          <RadioGroup defaultValue='no' className='flex items-center gap-7'>
            <div className='flex items-center gap-3'>
              <RadioGroupItem className='size-5 [&_svg]:size-3' value='yes' id='yes' />
              <Label htmlFor='yes'>Yes</Label>
            </div>
            <div className='flex items-center gap-3'>
              <RadioGroupItem className='size-5 [&_svg]:size-3' value='no' id='no' />
              <Label htmlFor='no'>No</Label>
            </div>
          </RadioGroup>
        </div>
        <div className='flex items-center gap-1.5'>
          <Checkbox className='bg-white' id={reviewTerms} />
          <Label htmlFor={reviewTerms} className='text-muted-foreground gap-1'>
            By publishing this review you agree with the{' '}
            <a href='#' className='text-primary underline'>
              terms and conditions.
            </a>
          </Label>
        </div>
      </div>
      <div className='flex items-center gap-5'>
        <Button type='submit'>Submit review</Button>
        <Button variant='outline'>Reset</Button>
      </div>
    </form>
  )
}

export default ProductReviewForm
