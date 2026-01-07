"""
Image Preprocessing Module
Prepares images for optimal OCR processing
"""

from PIL import Image, ImageEnhance, ImageFilter
import io


class ImagePreprocessor:
    """Handles image preprocessing for OCR optimization"""

    @staticmethod
    def preprocess(image_path: str, output_path: str = None) -> Image.Image:
        """
        Preprocess image for better OCR results

        Args:
            image_path: Path to input image
            output_path: Optional path to save preprocessed image

        Returns:
            Preprocessed PIL Image
        """
        # Load image
        img = Image.open(image_path)

        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')

        # Resize if too large (max 2048px on longest side)
        max_size = 2048
        if max(img.size) > max_size:
            ratio = max_size / max(img.size)
            new_size = (int(img.size[0] * ratio), int(img.size[1] * ratio))
            img = img.resize(new_size, Image.Resampling.LANCZOS)

        # Enhance contrast for better text recognition
        enhancer = ImageEnhance.Contrast(img)
        img = enhancer.enhance(1.3)

        # Enhance sharpness
        enhancer = ImageEnhance.Sharpness(img)
        img = enhancer.enhance(1.2)

        # Slight denoising
        img = img.filter(ImageFilter.MedianFilter(size=3))

        # Save if output path provided
        if output_path:
            img.save(output_path, quality=95)

        return img

    @staticmethod
    def compress_for_upload(image: Image.Image, max_size_kb: int = 500) -> bytes:
        """
        Compress image for efficient upload

        Args:
            image: PIL Image object
            max_size_kb: Maximum size in kilobytes

        Returns:
            Compressed image bytes
        """
        output = io.BytesIO()
        quality = 95

        while quality > 20:
            output.seek(0)
            output.truncate()
            image.save(output, format='JPEG', quality=quality, optimize=True)

            if len(output.getvalue()) <= max_size_kb * 1024:
                break

            quality -= 5

        return output.getvalue()

    @staticmethod
    def validate_image(image_path: str) -> tuple[bool, str]:
        """
        Validate that image is suitable for OCR

        Args:
            image_path: Path to image

        Returns:
            Tuple of (is_valid, error_message)
        """
        try:
            img = Image.open(image_path)

            # Check minimum dimensions
            min_dimension = 200
            if min(img.size) < min_dimension:
                return False, f"Image too small (minimum {min_dimension}px)"

            # Check maximum file size (10MB)
            import os
            file_size_mb = os.path.getsize(image_path) / (1024 * 1024)
            if file_size_mb > 10:
                return False, "Image too large (maximum 10MB)"

            # Check format
            valid_formats = ['JPEG', 'PNG', 'JPG']
            if img.format not in valid_formats:
                return False, f"Invalid format. Use {', '.join(valid_formats)}"

            return True, ""

        except Exception as e:
            return False, f"Invalid image file: {str(e)}"


# Example usage
if __name__ == "__main__":
    processor = ImagePreprocessor()

    # Validate
    is_valid, error = processor.validate_image("sample.png")
    print(f"Valid: {is_valid}, Error: {error}")

    # Preprocess
    if is_valid:
        processed_img = processor.preprocess("sample.png", "processed.png")
        print(f"Preprocessed image size: {processed_img.size}")
