"""Test script to verify the Python environment setup."""
import sys
import pkg_resources
import importlib

def check_python_version():
    """Check Python version."""
    version = sys.version_info
    if version.major != 3 or version.minor != 11:
        print(f"❌ Wrong Python version: {sys.version}")
        print("Please use Python 3.11")
        return False
    print(f"✅ Python version: {sys.version}")
    return True

def check_required_packages():
    """Check if all required packages are installed with correct versions."""
    with open("requirements.txt") as f:
        requirements = [
            line.strip()
            for line in f
            if line.strip() and not line.startswith("#")
        ]
    
    all_installed = True
    for req in requirements:
        try:
            pkg_name = req.split("==")[0]
            required_version = req.split("==")[1] if "==" in req else None
            
            if "[" in pkg_name:
                pkg_name = pkg_name.split("[")[0]
            
            pkg = pkg_resources.working_set.by_key.get(pkg_name)
            if pkg:
                installed_version = pkg.version
                if required_version and installed_version != required_version:
                    print(f"❌ {pkg_name}: installed={installed_version}, required={required_version}")
                    all_installed = False
                else:
                    print(f"✅ {pkg_name}: {installed_version}")
            else:
                print(f"❌ {pkg_name} not installed")
                all_installed = False
        except Exception as e:
            print(f"❌ Error checking {req}: {str(e)}")
            all_installed = False
    
    return all_installed

def check_imports():
    """Try importing key packages."""
    packages = [
        "fastapi",
        "sqlalchemy",
        "alembic",
        "uvicorn",
        "aiohttp",
        "openai",
    ]
    
    all_imported = True
    for package in packages:
        try:
            importlib.import_module(package)
            print(f"✅ Successfully imported {package}")
        except ImportError as e:
            print(f"❌ Failed to import {package}: {str(e)}")
            all_imported = False
    
    return all_imported

def main():
    """Run all checks."""
    print("\n=== Checking Python Environment ===\n")
    
    python_ok = check_python_version()
    
    print("\n=== Checking Required Packages ===\n")
    packages_ok = check_required_packages()
    
    print("\n=== Testing Key Imports ===\n")
    imports_ok = check_imports()
    
    print("\n=== Summary ===\n")
    if all([python_ok, packages_ok, imports_ok]):
        print("✅ All checks passed! Environment is properly set up.")
        sys.exit(0)
    else:
        print("❌ Some checks failed. Please fix the issues above.")
        sys.exit(1)

if __name__ == "__main__":
    main()
