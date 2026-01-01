from PIL import Image

def recolor_image(input_path, output_path, color):
    try:
        img = Image.open(input_path).convert("RGBA")
        
        # Create a new image with the target color
        colored_img = Image.new("RGBA", img.size, color)
        
        # Use the alpha channel of the original image as a mask
        img.paste(colored_img, (0, 0), img)
        
        img.save(output_path)
        print(f"Successfully recolored {input_path} to {output_path}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    recolor_image("UI/farvicon.png", "UI/farvicon_colored.png", (29, 73, 153, 255))
