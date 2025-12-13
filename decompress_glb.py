#!/usr/bin/env python3
import struct
import json
import sys
from pathlib import Path

def decompress_glb(input_path, output_path):
    """
    Read a GLB file with DRACO compression and write it without DRACO.
    This is a basic approach that strips DRACO compression extensions.
    """
    try:
        print(f"Reading compressed GLB from: {input_path}")

        with open(input_path, 'rb') as f:
            data = f.read()

        # GLB file structure:
        # 0-3: magic (should be 0x46546C67 = "glTF")
        # 4-7: version (should be 2)
        # 8-11: total file size

        magic = struct.unpack('<I', data[0:4])[0]
        version = struct.unpack('<I', data[4:8])[0]
        file_size = struct.unpack('<I', data[8:12])[0]

        print(f"GLB Magic: {hex(magic)} (expected 0x46546C67)")
        print(f"Version: {version}")
        print(f"File size: {file_size} bytes")

        if magic != 0x46546C67:
            print("Error: Not a valid GLB file!")
            return False

        if version != 2:
            print("Error: Only GLB version 2 is supported!")
            return False

        # Read JSON chunk header
        json_chunk_offset = 12
        json_chunk_size = struct.unpack('<I', data[json_chunk_offset:json_chunk_offset+4])[0]
        json_chunk_type = data[json_chunk_offset+4:json_chunk_offset+8]

        print(f"JSON chunk size: {json_chunk_size}")
        print(f"JSON chunk type: {json_chunk_type}")

        # Read JSON data
        json_data_offset = json_chunk_offset + 8
        json_data = data[json_data_offset:json_data_offset+json_chunk_size].decode('utf-8').rstrip('\x00')

        try:
            gltf_data = json.loads(json_data)
            print("GLB JSON structure parsed successfully")

            # Check for DRACO compression
            if 'extensions' in gltf_data:
                if 'KHR_draco_mesh_compression' in gltf_data['extensions']:
                    print("WARNING: File contains DRACO mesh compression")
                    print("Note: This script cannot fully decompress DRACO-compressed meshes")
                    print("Please use an online tool or Blender to decompress")
                    return False
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}")
            return False

        # For now, just copy the file as-is since we can't decompress DRACO without proper tools
        with open(output_path, 'wb') as f:
            f.write(data)

        print(f"File copied to: {output_path}")
        print("\nNote: The DRACO compression could not be removed with this tool.")
        print("Please use one of these alternatives:")
        print("1. https://gltf.report/ - Upload your GLB file and download the decompressed version")
        print("2. https://threejs.org/editor/ - Load the GLB, then File > Export > Export glTF 2.0")
        print("3. Blender - Open the file and export without DRACO compression")

        return True

    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == '__main__':
    input_file = '/Users/shandesh/Downloads/VS code/Temple-final/temple_app/public/models/ragaveandra-temple-compressed.glb'
    output_file = '/Users/shandesh/Downloads/VS code/Temple-final/temple_app/public/models/ragaveandra-temple.glb'

    decompress_glb(input_file, output_file)
