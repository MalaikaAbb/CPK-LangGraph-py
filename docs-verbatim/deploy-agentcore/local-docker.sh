cd docker
cp .env.example .env
# Fill in AWS credentials and STACK_NAME
./up.sh --build
