import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PropertyImage } from 'src/generated/prisma/client';

export interface UploadedFile {
  filename: string;
  mimetype: string;
  size: number;
  path: string;
}

@Injectable()
export class PropertyImageService {
  constructor(private prisma: PrismaService) {}

  async uploadImages(propertyId: string, files: UploadedFile[]) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      throw new BadRequestException('Property not found');
    }

    const currentCount = await this.prisma.propertyImage.count({
      where: { propertyId },
    });

    // Max 8 images per property
    if (currentCount + files.length > 8) {
      throw new BadRequestException('Cannot exceed 8 images per property');
    }
    const images: PropertyImage[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isPrimary = currentCount === 0 && i === 0; // First image is primary

      const image = await this.prisma.propertyImage.create({
        data: {
          propertyId,
          imageUrl: file.path, // In production, upload to S3/cloud storage
          filename: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          isPrimary,
          order: currentCount + i,
        },
      });

      images.push(image);
    }

    return images;
  }

  async deleteImage(imageId: string, propertyId: string) {
    const image = await this.prisma.propertyImage.findUnique({
      where: { id: imageId },
    });

    if (!image || image.propertyId !== propertyId) {
      throw new BadRequestException('Image not found');
    }

    // If deleting primary image, make next image primary
    if (image.isPrimary) {
      const nextImage = await this.prisma.propertyImage.findFirst({
        where: { propertyId, id: { not: imageId } },
        orderBy: { order: 'asc' },
      });

      if (nextImage) {
        await this.prisma.propertyImage.update({
          where: { id: nextImage.id },
          data: { isPrimary: true },
        });
      }
    }

    await this.prisma.propertyImage.delete({
      where: { id: imageId },
    });

    return { message: 'Image deleted successfully' };
  }

  async reorderImages(propertyId: string, imageIds: string[]) {
    // Verify all images belong to property
    const images = await this.prisma.propertyImage.findMany({
      where: { propertyId },
    });

    if (images.length !== imageIds.length) {
      throw new BadRequestException('Invalid image IDs');
    }

    // Update order for all images
    const updatePromises = imageIds.map((id, index) =>
      this.prisma.propertyImage.update({
        where: { id },
        data: { order: index },
      }),
    );

    await Promise.all(updatePromises);

    return { message: 'Images reordered successfully' };
  }
}
