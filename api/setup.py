import glob
from distutils.core import setup

if len(glob.glob('viveka*.so')) == 0:
    raise ValueError(
        'viveka*.so is not found. You have not finished \
        compiling related cpp hpp files or \'python3-config --extension-suffix\'\
        command does not work properly in your environment')
viveka_so = glob.glob('viveka*.so')[0]

setup(
    name='viveka',
    version=0.1,
    packages=[''],
    package_dir={'': '.'},
    package_data={'': [viveka_so]},
    py_modules=['viveka'])